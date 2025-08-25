import "dotenv/config";
import { Resend } from "resend";
import admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { Firestore } from '@google-cloud/firestore';

// Initialize Firebase Admin SDK
let adminDb;
try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.');
  }
  const serviceAccount = JSON.parse(serviceAccountString);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }

  // Explicitly create a Firestore client with REST transport to avoid gRPC issues on Vercel
  adminDb = new Firestore({
      projectId: serviceAccount.project_id,
      credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
      },
      preferRest: true,
  });

} catch (error) {
  console.error('Firebase Admin SDK setup error:', error.message);
  // If admin SDK fails, the API cannot function. We'll let it fail and log the error.
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware to verify Firebase ID token and check for admin role
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    if (!admin.apps.length) {
      // This check is important because the admin SDK might have failed to initialize
      throw new Error('Firebase Admin SDK not initialized. Check server configuration.');
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.admin === true) {
      req.user = decodedToken; // Attach user info to the request object
      return next();
    } else {
      return res.status(403).json({ success: false, error: 'Forbidden: User is not an admin.' });
    }
  } catch (error) {
    console.error('Error verifying admin token:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Token has expired.' });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token or configuration error.' });
  }
};

// ===== HELPER to check if AdminDB is available =====
const checkDb = (res) => {
  if (!adminDb) {
    console.error("Database not initialized. Check server configuration.");
    res.status(500).json({ success: false, error: 'Database not initialized' });
    return false;
  }
  return true;
}

// ===== ADMIN: COMMENT FUNCTIONS =====
const adminGetComments = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const snapshot = await adminDb.collection('comments').orderBy('timestamp', 'desc').get();
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id, timestamp: data.timestamp.toDate().toISOString() };
    });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching all comments for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
};

const adminUpdateComment = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });
    }

    // Safeguard to ensure 'approved' is always a boolean, preventing data type mismatches.
    if (typeof updateData.approved !== 'undefined') {
      updateData.approved = (updateData.approved === true || updateData.approved === 'true');
    }

    await adminDb.collection('comments').doc(id).update(updateData);
    res.status(200).json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    console.error(`Error updating comment ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to update comment' });
  }
};

const adminDeleteComment = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    await adminDb.collection('comments').doc(id).delete();
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting comment ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
};

// ===== ADMIN: SUGGESTION FUNCTIONS =====
const adminGetSuggestions = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const snapshot = await adminDb.collection('suggestions').orderBy('timestamp', 'desc').get();
    const suggestions = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id, timestamp: data.timestamp.toDate().toISOString() };
    });
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching all suggestions for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

const adminUpdateSuggestion = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });
    }
    await adminDb.collection('suggestions').doc(id).update(updateData);
    res.status(200).json({ success: true, message: 'Suggestion updated successfully' });
  } catch (error) {
    console.error(`Error updating suggestion ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to update suggestion' });
  }
};

const adminDeleteSuggestion = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    await adminDb.collection('suggestions').doc(id).delete();
    res.status(200).json({ success: true, message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error(`Error deleting suggestion ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete suggestion' });
  }
};

// ===== PUBLIC: COMMENT FUNCTIONS =====
const getComments = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    console.log("Attempting Firestore query for approved: true...");

    const snapshot = await adminDb.collection('comments')
      .where('approved', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    console.log(`Query executed. Snapshot empty: ${snapshot.empty}`);
    console.log(`Snapshot size: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log("No documents found for approved: true.");
    } else {
      console.log("Documents found! Logging first 5:");
      snapshot.docs.slice(0, 5).forEach((doc, index) => {
        console.log(`Document ${index}:`, doc.id, doc.data());
      });
    }

    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id, timestamp: data.timestamp.toDate().toISOString() };
    });

    res.status(200).json({ success: true, data: comments });

  } catch (error) {
    console.error("Error during Firestore query:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments', details: error.message });
  }
};

const addComment = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { author, email, content, rating, type, userFingerprint, isAnonymous } = req.body;
    // Validation
    if (!content || content.trim().length < 10) return res.status(400).json({ success: false, error: 'Comment must be at least 10 characters long' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    if (!isAnonymous && (!author || !email)) return res.status(400).json({ success: false, error: 'Name and email are required' });

    const commentData = {
      author: author || 'Anonymous',
      email: isAnonymous ? '' : (email || ''),
      content: content.trim(),
      rating: parseInt(rating),
      type: type || 'feedback',
      userFingerprint: userFingerprint || 'unknown',
      isAnonymous: Boolean(isAnonymous),
      timestamp: Timestamp.now(),
      likes: 0,
      approved: false,
    };
    const docRef = await adminDb.collection('comments').add(commentData);
    res.status(201).json({ success: true, data: { id: docRef.id, ...commentData } });
  } catch (error) {
    console.error('Error in addComment function:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  }
};

// ===== PUBLIC: SUGGESTION FUNCTIONS =====
const getSuggestions = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { limit: limitParam = '50', orderBy: orderByParam = 'votes', status: statusFilter = 'all' } = req.query;
    let query = adminDb.collection('suggestions');
    if (statusFilter !== 'all') query = query.where('status', '==', statusFilter);
    if (orderByParam === 'votes') query = query.orderBy('votes', 'desc');
    else if (orderByParam === 'timestamp') query = query.orderBy('timestamp', 'desc');
    if (limitParam && limitParam !== 'all') query = query.limit(parseInt(limitParam));
    
    const snapshot = await query.get();
    const suggestions = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id, timestamp: data.timestamp.toDate().toISOString() };
    });
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

const addSuggestion = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { title, description, author, email, isAnonymous, userFingerprint } = req.body;
    // Validation
    if (!title || !description || !userFingerprint) return res.status(400).json({ success: false, error: 'Title, description, and fingerprint are required' });
    if (!isAnonymous && (!author || !email)) return res.status(400).json({ success: false, error: 'Author and email required' });

    const suggestionData = {
      title: title.trim(),
      description: description.trim(),
      author: isAnonymous ? 'Anonymous User' : author.trim(),
      email: isAnonymous ? null : email.trim(),
      isAnonymous: Boolean(isAnonymous),
      userFingerprint,
      timestamp: Timestamp.now(),
      status: 'pending',
      votes: 0,
      voters: [],
      priority: 'normal',
      tags: [],
      adminNotes: null
    };
    const docRef = await adminDb.collection('suggestions').add(suggestionData);
    res.status(201).json({ success: true, data: { id: docRef.id, ...suggestionData } });
  } catch (error) {
    console.error('Error in addSuggestion function:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  }
};

// ===== PUBLIC: LIKE FUNCTION =====
const likeComment = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Comment ID is required.' });
    }
    const commentRef = adminDb.collection('comments').doc(id);
    await commentRef.update({
      likes: FieldValue.increment(1)
    });
    res.status(200).json({ success: true, message: 'Comment liked successfully.' });
  } catch (error) {
    console.error(`Error liking comment ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to like comment.' });
  }
};

// ===== PUBLIC: STATS FUNCTION =====
const getStats = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const commentsRef = adminDb.collection('comments');

    // Get total counts
    const commentsCountSnapshot = await commentsRef.count().get();
    const suggestionsCountSnapshot = await adminDb.collection('suggestions').count().get();

    // Get all approved comments to calculate average rating and total likes
    const approvedCommentsSnapshot = await commentsRef.where('approved', '==', true).get();

    let totalLikes = 0;
    let totalRating = 0;
    let commentsWithRatingCount = 0;

    approvedCommentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.likes) {
        totalLikes += data.likes;
      }
      if (data.rating && typeof data.rating === 'number') {
        totalRating += data.rating;
        commentsWithRatingCount++;
      }
    });

    const averageRating = commentsWithRatingCount > 0 ? totalRating / commentsWithRatingCount : 0;

    const stats = {
      totalComments: commentsCountSnapshot.data().count,
      totalSuggestions: suggestionsCountSnapshot.data().count,
      totalLikes: totalLikes,
      averageRating: parseFloat(averageRating.toFixed(1)),
      recentActivity: 0, // Placeholder for now
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback statistics' });
  }
};

// ===== MAIN HANDLER =====

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Disable caching for all API routes
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  // --- Admin Routes ---
  if (url.startsWith('/api/admin')) {
    // verifyAdmin will handle sending an error response if the user is not an admin.
    // The third argument is a 'next' function that will only be called upon successful verification.
    return verifyAdmin(req, res, async () => {
      try {
        // Admin Comments
        const adminCommentIdMatch = url.match(/^\/api\/admin\/comments\/([a-zA-Z0-9_-]+)$/);
        if (adminCommentIdMatch) {
          req.params = { id: adminCommentIdMatch[1] };
          if (method === 'PUT') return await adminUpdateComment(req, res);
          if (method === 'DELETE') return await adminDeleteComment(req, res);
        }
        if (url === '/api/admin/comments') {
          if (method === 'GET') return await adminGetComments(req, res);
        }

        // Admin Suggestions
        const adminSuggestionIdMatch = url.match(/^\/api\/admin\/suggestions\/([a-zA-Z0-9_-]+)$/);
        if (adminSuggestionIdMatch) {
          req.params = { id: adminSuggestionIdMatch[1] };
          if (method === 'PUT') return await adminUpdateSuggestion(req, res);
          if (method === 'DELETE') return await adminDeleteSuggestion(req, res);
        }
        if (url === '/api/admin/suggestions') {
          if (method === 'GET') return await adminGetSuggestions(req, res);
        }

        return res.status(404).json({ success: false, error: 'Admin route not found' });

      } catch (error) {
        console.error('Error in admin route handler:', error);
        return res.status(500).json({ success: false, error: 'Internal server error in admin route' });
      }
    });
  }

  // --- Public Routes ---
  try {
    // Comments routes
    if (url === '/api/comments' || url === '/api/feedback/comments') {
      if (method === 'GET') return await getComments(req, res);
      if (method === 'POST') return await addComment(req, res);
    }

    // Suggestions routes  
    if (url === '/api/suggestions' || url === '/api/feedback/suggestions') {
      if (method === 'GET') return await getSuggestions(req, res);
      if (method === 'POST') return await addSuggestion(req, res);
    }

    // Like comment route
    const likeCommentMatch = url.match(/^\/api\/feedback\/comments\/([a-zA-Z0-9_-]+)\/like$/);
    if (likeCommentMatch && method === 'POST') {
      req.params = { id: likeCommentMatch[1] };
      return await likeComment(req, res);
    }

    // Stats route
    if (url === '/api/stats' || url === '/api/feedback/stats') {
      if (method === 'GET') return await getStats(req, res);
    }

    // Contact form is now handled by api/contact.js

    // 404 for unknown public routes
    return res.status(404).json({ success: false, error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
