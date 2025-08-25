import "dotenv/config";
import { Resend } from "resend";
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  updateDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      // We don't throw an error here, as the app can run without admin features.
      // The admin routes will handle the case where the SDK is not initialized.
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Admin features will be disabled.');
    } else {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully.');
    }
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error.message);
}

// Initialize Firebase (Client SDK)
let db;
try {
  if (!getApps().length) {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
    };
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    db = getFirestore();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
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

// ===== ADMIN: COMMENT FUNCTIONS =====

const adminGetComments = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(commentsQuery);
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching all comments for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
};

const adminUpdateComment = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { id } = req.params;
    const updateData = req.body;

    // Basic validation to prevent unintended updates
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });
    }

    const commentRef = doc(db, 'comments', id);
    await updateDoc(commentRef, updateData);

    res.status(200).json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    console.error(`Error updating comment ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to update comment' });
  }
};

const adminDeleteComment = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { id } = req.params;
    await deleteDoc(doc(db, 'comments', id));

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting comment ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
};

// ===== ADMIN: SUGGESTION FUNCTIONS =====

const adminGetSuggestions = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const suggestionsQuery = query(collection(db, 'suggestions'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(suggestionsQuery);
    const suggestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching all suggestions for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

const adminUpdateSuggestion = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });
    }

    const suggestionRef = doc(db, 'suggestions', id);
    await updateDoc(suggestionRef, updateData);

    res.status(200).json({ success: true, message: 'Suggestion updated successfully' });
  } catch (error) {
    console.error(`Error updating suggestion ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to update suggestion' });
  }
};

const adminDeleteSuggestion = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { id } = req.params;
    await deleteDoc(doc(db, 'suggestions', id));

    res.status(200).json({ success: true, message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error(`Error deleting suggestion ${req.params.id} for admin:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete suggestion' });
  }
};


// ===== COMMENT FUNCTIONS =====

const getComments = async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({ comments: [] });
    }

    const commentsQuery = query(
      collection(db, 'comments'),
      where('approved', '==', true),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
};

const addComment = async (req, res) => {
  try {
    const { author, email, content, rating, type, userFingerprint, isAnonymous } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Comment must be at least 10 characters long' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    if (!isAnonymous && (!author || !email)) {
      return res.status(400).json({ success: false, error: 'Name and email are required for non-anonymous comments' });
    }

    const commentData = {
      author: author || 'Anonymous',
      email: isAnonymous ? '' : (email || ''),
      content: content.trim(),
      rating: parseInt(rating),
      type: type || 'feedback',
      userFingerprint: userFingerprint || 'unknown',
      isAnonymous: Boolean(isAnonymous),
      timestamp: new Date(),
      likes: 0,
      approved: true,
    };

    if (!db) {
      console.error('Firebase connection error: database not initialized.');
      return res.status(500).json({
        success: false,
        error: 'The server is not connected to the database. Please check server configuration.'
      });
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 5000) // Increased timeout
      );

      const savePromise = addDoc(collection(db, 'comments'), commentData);
      const docRef = await Promise.race([savePromise, timeoutPromise]);

      return res.status(201).json({
        success: true,
        data: { id: docRef.id, ...commentData },
        message: 'Comment saved successfully!'
      });

    } catch (firebaseError) {
      console.error('🔥 Firebase error while saving comment:', firebaseError);
      return res.status(500).json({
        success: false,
        error: 'A database error occurred while saving the comment.',
        details: firebaseError.message
      });
    }

  } catch (error) {
    console.error('❌ Error in addComment function:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred while processing the comment.' });
  }
};

// ===== SUGGESTION FUNCTIONS =====

const getSuggestions = async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { 
      limit: limitParam = '50', 
      orderBy: orderByParam = 'votes',
      status: statusFilter = 'all'
    } = req.query;
    
    const suggestionsRef = collection(db, 'suggestions');
    let q = query(suggestionsRef);
    
    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }
    
    if (orderByParam === 'votes') {
      q = query(q, orderBy('votes', 'desc'));
    } else if (orderByParam === 'timestamp') {
      q = query(q, orderBy('timestamp', 'desc'));
    }
    
    if (limitParam && limitParam !== 'all') {
      q = query(q, limit(parseInt(limitParam)));
    }
    
    const snapshot = await getDocs(q);
    const suggestions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

const addSuggestion = async (req, res) => {
  try {
    const { title, description, author, email, isAnonymous, userFingerprint } = req.body;

    if (!title || !description || !userFingerprint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, description, and user fingerprint are required' 
      });
    }

    if (!isAnonymous && (!author || !email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Author and email required for non-anonymous suggestions' 
      });
    }

    const suggestionData = {
      title: title.trim(),
      description: description.trim(),
      author: isAnonymous ? 'Anonymous User' : author.trim(),
      email: isAnonymous ? null : email.trim(),
      isAnonymous: Boolean(isAnonymous),
      userFingerprint,
      timestamp: new Date(),
      status: 'pending',
      votes: 0,
      voters: [],
      priority: 'normal',
      tags: [],
      adminNotes: null
    };

    if (!db) {
      console.error('Firebase connection error: database not initialized.');
      return res.status(500).json({
        success: false,
        error: 'The server is not connected to the database. Please check server configuration.'
      });
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const savePromise = addDoc(collection(db, 'suggestions'), suggestionData);
      const docRef = await Promise.race([savePromise, timeoutPromise]);

      return res.status(201).json({
        success: true,
        data: { id: docRef.id, ...suggestionData }
      });

    } catch (firebaseError) {
      console.error('🔥 Firebase error while saving suggestion:', firebaseError);
      return res.status(500).json({
        success: false,
        error: 'A database error occurred while saving the suggestion.',
        details: firebaseError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Error in addSuggestion function:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred while processing the suggestion.' });
  }
};

// ===== STATS FUNCTION =====

const getStats = async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        totalComments: 0,
        totalSuggestions: 0,
        totalLikes: 0,
        recentActivity: 0,
        averageRating: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    // In a production app, you'd aggregate real stats from Firebase
    const stats = {
      totalComments: 0,
      totalSuggestions: 0,
      totalLikes: 0,
      recentActivity: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
};

// ===== MAIN HANDLER =====

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

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
