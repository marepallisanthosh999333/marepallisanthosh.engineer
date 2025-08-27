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

const pinComment = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    const commentRef = adminDb.collection('comments').doc(id);

    await adminDb.runTransaction(async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error("Comment not found.");
      }
      const currentIsPinned = commentDoc.data().isPinned || false;
      transaction.update(commentRef, { isPinned: !currentIsPinned });
    });

    res.status(200).json({ success: true, message: 'Comment pin status toggled.' });
  } catch (error) {
    console.error(`Error pinning comment ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to pin comment.' });
  }
};

const adminGetComments = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const snapshot = await adminDb.collection('comments').orderBy('timestamp', 'desc').get();
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      // Sanitize to only what the admin needs, removing fingerprint
      return {
        id: doc.id,
        author: data.author,
        email: data.email,
        content: data.content,
        rating: data.rating,
        likes: data.likes || 0,
        isAnonymous: data.isAnonymous,
        approved: data.approved,
        timestamp: data.timestamp.toDate().toISOString(),
      };
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
      // Sanitize to only what the admin needs, removing fingerprint and voters array
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        author: data.author,
        email: data.email,
        votes: data.votes || 0,
        status: data.status,
        isAnonymous: data.isAnonymous,
        isApproved: data.isApproved,
        timestamp: data.timestamp.toDate().toISOString(),
      };
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
    const snapshot = await adminDb.collection('comments')
      .where('approved', '==', true)
      .orderBy('isPinned', 'desc')
      .orderBy('likes', 'desc')
      .limit(50)
      .get();
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      // Sanitize the output to only include necessary and safe fields
      return {
        id: doc.id,
        author: data.author,
        content: data.content,
        rating: data.rating,
        likes: data.likes || 0,
        isAnonymous: data.isAnonymous,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
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
      isPinned: false,
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
    let query = adminDb.collection('suggestions').where('isApproved', '==', true);
    if (statusFilter !== 'all') query = query.where('status', '==', statusFilter);

    // Default sort by votes, but allow override by timestamp
    if (orderByParam === 'timestamp') {
      query = query.orderBy('timestamp', 'desc');
    } else {
      query = query.orderBy('votes', 'desc');
    }
    if (limitParam && limitParam !== 'all') query = query.limit(parseInt(limitParam));
    
    const snapshot = await query.get();
    const suggestions = snapshot.docs.map(doc => {
      const data = doc.data();
      // Sanitize the output to only include necessary and safe fields
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        author: data.author,
        votes: data.votes || 0,
        status: data.status,
        isAnonymous: data.isAnonymous,
        timestamp: data.timestamp.toDate().toISOString(),
      };
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
      isApproved: false,
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

// ===== PUBLIC: VOTE FUNCTION =====
const voteSuggestion = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params;
    const { userFingerprint } = req.body;

    if (!id || !userFingerprint) {
      return res.status(400).json({ success: false, error: 'Suggestion ID and user fingerprint are required.' });
    }

    const suggestionRef = adminDb.collection('suggestions').doc(id);

    await adminDb.runTransaction(async (transaction) => {
      const suggestionDoc = await transaction.get(suggestionRef);
      if (!suggestionDoc.exists) {
        throw new Error("Suggestion not found.");
      }

      const voters = suggestionDoc.data().voters || [];
      if (voters.includes(userFingerprint)) {
        // User has already voted, but we don't want to send an error.
        // We just silently do nothing to prevent revealing who has voted.
        return;
      }

      transaction.update(suggestionRef, {
        votes: FieldValue.increment(1),
        voters: FieldValue.arrayUnion(userFingerprint)
      });
    });

    res.status(200).json({ success: true, message: 'Suggestion voted successfully.' });
  } catch (error) {
    if (error.message === "Suggestion not found.") {
      return res.status(404).json({ success: false, error: error.message });
    }
    console.error(`Error voting for suggestion ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to vote for suggestion.' });
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

// ===== PUBLIC: COMMENT REPLIES =====
const getCommentReplies = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params; // comment id
    if (!id) return res.status(400).json({ success: false, error: 'Comment ID is required.' });

    const repliesRef = adminDb.collection('comments').doc(id).collection('replies');
    const snapshot = await repliesRef.where('approved', '==', true).orderBy('timestamp', 'asc').get();
    const replies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        content: data.content,
        isAnonymous: data.isAnonymous,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    console.error(`Error fetching replies for comment ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch replies' });
  }
};

const addCommentReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params; // comment id
    const { author, email, content, isAnonymous, userFingerprint } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'Comment ID is required.' });
    if (!content || content.trim().length < 3) return res.status(400).json({ success: false, error: 'Reply must be at least 3 characters long' });

    const replyData = {
      author: isAnonymous ? 'Anonymous' : (author || 'Anonymous'),
      email: isAnonymous ? null : (email || null),
      content: content.trim(),
      isAnonymous: Boolean(isAnonymous),
      userFingerprint: userFingerprint || 'unknown',
      timestamp: Timestamp.now(),
      approved: false,
    };

    const docRef = await adminDb.collection('comments').doc(id).collection('replies').add(replyData);
    res.status(201).json({ success: true, data: { id: docRef.id, ...replyData } });
  } catch (error) {
    console.error(`Error adding reply to comment ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to add reply' });
  }
};

// ===== ADMIN: COMMENT REPLIES =====
const adminGetCommentReplies = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    // Router may set either `id` or `commentId` depending on which match branch ran.
    const id = req.params.commentId || req.params.id;
    if (!id) return res.status(400).json({ success: false, error: 'Comment ID is required.' });
    const repliesRef = adminDb.collection('comments').doc(id).collection('replies');
    const snapshot = await repliesRef.orderBy('timestamp', 'desc').get();
    const replies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        email: data.email || null,
        content: data.content,
        isAnonymous: data.isAnonymous,
        approved: data.approved,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    console.error(`Error fetching admin replies for comment ${req.params.commentId || req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch replies' });
  }
};

const adminUpdateCommentReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { commentId, replyId } = req.params;
    const updateData = req.body;
    if (!commentId || !replyId) return res.status(400).json({ success: false, error: 'Comment ID and Reply ID are required.' });
    if (Object.keys(updateData).length === 0) return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });

    // Ensure approved is boolean if present
    if (typeof updateData.approved !== 'undefined') {
      updateData.approved = (updateData.approved === true || updateData.approved === 'true');
    }

    await adminDb.collection('comments').doc(commentId).collection('replies').doc(replyId).update(updateData);
    res.status(200).json({ success: true, message: 'Reply updated successfully' });
  } catch (error) {
    console.error(`Error updating reply ${req.params.replyId} for comment ${req.params.commentId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to update reply' });
  }
};

const adminDeleteCommentReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { commentId, replyId } = req.params;
    if (!commentId || !replyId) return res.status(400).json({ success: false, error: 'Comment ID and Reply ID are required.' });
    await adminDb.collection('comments').doc(commentId).collection('replies').doc(replyId).delete();
    res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error(`Error deleting reply ${req.params.replyId} for comment ${req.params.commentId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete reply' });
  }
};

// ===== PUBLIC: SUGGESTION REPLIES =====
const getSuggestionReplies = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params; // suggestion id
    if (!id) return res.status(400).json({ success: false, error: 'Suggestion ID is required.' });

    const repliesRef = adminDb.collection('suggestions').doc(id).collection('replies');
    const snapshot = await repliesRef.where('approved', '==', true).orderBy('timestamp', 'asc').get();
    const replies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        content: data.content,
        isAnonymous: data.isAnonymous,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    console.error(`Error fetching replies for suggestion ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch replies' });
  }
};

const addSuggestionReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { id } = req.params; // suggestion id
    const { author, email, content, isAnonymous, userFingerprint } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'Suggestion ID is required.' });
    if (!content || content.trim().length < 3) return res.status(400).json({ success: false, error: 'Reply must be at least 3 characters long' });

    const replyData = {
      author: isAnonymous ? 'Anonymous' : (author || 'Anonymous'),
      email: isAnonymous ? null : (email || null),
      content: content.trim(),
      isAnonymous: Boolean(isAnonymous),
      userFingerprint: userFingerprint || 'unknown',
      timestamp: Timestamp.now(),
      approved: false,
    };

    const docRef = await adminDb.collection('suggestions').doc(id).collection('replies').add(replyData);
    res.status(201).json({ success: true, data: { id: docRef.id, ...replyData } });
  } catch (error) {
    console.error(`Error adding reply to suggestion ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to add reply' });
  }
};

// ===== ADMIN: SUGGESTION REPLIES =====
const adminGetSuggestionReplies = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    // Router may set either `id` or `suggestionId` depending on which match branch ran.
    const id = req.params.suggestionId || req.params.id;
    if (!id) return res.status(400).json({ success: false, error: 'Suggestion ID is required.' });
    const repliesRef = adminDb.collection('suggestions').doc(id).collection('replies');
    const snapshot = await repliesRef.orderBy('timestamp', 'desc').get();
    const replies = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        email: data.email || null,
        content: data.content,
        isAnonymous: data.isAnonymous,
        approved: data.approved,
        timestamp: data.timestamp.toDate().toISOString(),
      };
    });
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    console.error(`Error fetching admin replies for suggestion ${req.params.suggestionId || req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch replies' });
  }
};

const adminUpdateSuggestionReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { suggestionId, replyId } = req.params;
    const updateData = req.body;
    if (!suggestionId || !replyId) return res.status(400).json({ success: false, error: 'Suggestion ID and Reply ID are required.' });
    if (Object.keys(updateData).length === 0) return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });

    if (typeof updateData.approved !== 'undefined') {
      updateData.approved = (updateData.approved === true || updateData.approved === 'true');
    }

    await adminDb.collection('suggestions').doc(suggestionId).collection('replies').doc(replyId).update(updateData);
    res.status(200).json({ success: true, message: 'Reply updated successfully' });
  } catch (error) {
    console.error(`Error updating reply ${req.params.replyId} for suggestion ${req.params.suggestionId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to update reply' });
  }
};

const adminDeleteSuggestionReply = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const { suggestionId, replyId } = req.params;
    if (!suggestionId || !replyId) return res.status(400).json({ success: false, error: 'Suggestion ID and Reply ID are required.' });
    await adminDb.collection('suggestions').doc(suggestionId).collection('replies').doc(replyId).delete();
    res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error(`Error deleting reply ${req.params.replyId} for suggestion ${req.params.suggestionId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete reply' });
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

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCommentsSnapshot = await commentsRef.where('timestamp', '>=', sevenDaysAgo).count().get();
    const recentSuggestionsSnapshot = await adminDb.collection('suggestions').where('timestamp', '>=', sevenDaysAgo).count().get();
    const recentActivity = recentCommentsSnapshot.data().count + recentSuggestionsSnapshot.data().count;

    const stats = {
      totalComments: commentsCountSnapshot.data().count,
      totalSuggestions: suggestionsCountSnapshot.data().count,
      totalLikes: totalLikes,
      averageRating: parseFloat(averageRating.toFixed(1)),
      recentActivity: recentActivity,
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback statistics' });
  }
};

// ===== SITE SETTINGS =====
const getSiteSettings = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const doc = await adminDb.collection('config').doc('site').get();
    if (!doc.exists) {
      // default settings
      return res.status(200).json({ success: true, data: { filters: { hue: 0, saturate: 100, brightness: 100, contrast: 100, sepia: 0 } } });
    }
    return res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch site settings' });
  }
};

const adminUpdateSiteSettings = async (req, res) => {
  if (!checkDb(res)) return;
  try {
    const updateData = req.body;
    if (!updateData || Object.keys(updateData).length === 0) return res.status(400).json({ success: false, error: 'Request body cannot be empty.' });
    await adminDb.collection('config').doc('site').set(updateData, { merge: true });
    res.status(200).json({ success: true, message: 'Site settings updated' });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update site settings' });
  }
};

// ===== MAIN HANDLER =====

export default async function handler(req, res) {
  // Set CORS headers and basic security headers
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(s=>s.trim()).filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // No wildcard; if origin not allowed, do not set credentials
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Basic HTTP security headers (can be adjusted for your deployment needs)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none';");

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
        const pinCommentMatch = url.match(/^\/api\/admin\/comments\/([a-zA-Z0-9_-]+)\/pin$/);
        if (pinCommentMatch && method === 'POST') {
          req.params = { id: pinCommentMatch[1] };
          return await pinComment(req, res);
        }

        const adminCommentIdMatch = url.match(/^\/api\/admin\/comments\/([a-zA-Z0-9_-]+)$/);
        if (adminCommentIdMatch) {
          req.params = { id: adminCommentIdMatch[1] };
          if (method === 'PUT') return await adminUpdateComment(req, res);
          if (method === 'DELETE') return await adminDeleteComment(req, res);
        }
        // Admin Comment Replies
        const adminCommentRepliesMatch = url.match(/^\/api\/admin\/comments\/([a-zA-Z0-9_-]+)\/replies$/);
        if (adminCommentRepliesMatch) {
          req.params = { commentId: adminCommentRepliesMatch[1] };
          if (method === 'GET') return await adminGetCommentReplies(req, res);
        }
        const adminCommentReplyMatch = url.match(/^\/api\/admin\/comments\/([a-zA-Z0-9_-]+)\/replies\/([a-zA-Z0-9_-]+)$/);
        if (adminCommentReplyMatch) {
          req.params = { commentId: adminCommentReplyMatch[1], replyId: adminCommentReplyMatch[2] };
          if (method === 'PUT') return await adminUpdateCommentReply(req, res);
          if (method === 'DELETE') return await adminDeleteCommentReply(req, res);
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
        // Admin Suggestion Replies
        const adminSuggestionRepliesMatch = url.match(/^\/api\/admin\/suggestions\/([a-zA-Z0-9_-]+)\/replies$/);
        if (adminSuggestionRepliesMatch) {
          req.params = { suggestionId: adminSuggestionRepliesMatch[1] };
          if (method === 'GET') return await adminGetSuggestionReplies(req, res);
        }
        const adminSuggestionReplyMatch = url.match(/^\/api\/admin\/suggestions\/([a-zA-Z0-9_-]+)\/replies\/([a-zA-Z0-9_-]+)$/);
        if (adminSuggestionReplyMatch) {
          req.params = { suggestionId: adminSuggestionReplyMatch[1], replyId: adminSuggestionReplyMatch[2] };
          if (method === 'PUT') return await adminUpdateSuggestionReply(req, res);
          if (method === 'DELETE') return await adminDeleteSuggestionReply(req, res);
        }
        if (url === '/api/admin/suggestions') {
          if (method === 'GET') return await adminGetSuggestions(req, res);
        }

        // Admin: update site settings
        if (url === '/api/admin/site-settings' && method === 'PUT') {
          return await adminUpdateSiteSettings(req, res);
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

    // Comment replies
    const commentRepliesMatch = url.match(/^\/api\/feedback\/comments\/([a-zA-Z0-9_-]+)\/replies$/);
    if (commentRepliesMatch) {
      req.params = { id: commentRepliesMatch[1] };
      if (method === 'GET') return await getCommentReplies(req, res);
      if (method === 'POST') return await addCommentReply(req, res);
    }

    // Suggestions routes  
    if (url === '/api/suggestions' || url === '/api/feedback/suggestions') {
      if (method === 'GET') return await getSuggestions(req, res);
      if (method === 'POST') return await addSuggestion(req, res);
    }

    // Suggestion replies
    const suggestionRepliesMatch = url.match(/^\/api\/feedback\/suggestions\/([a-zA-Z0-9_-]+)\/replies$/);
    if (suggestionRepliesMatch) {
      req.params = { id: suggestionRepliesMatch[1] };
      if (method === 'GET') return await getSuggestionReplies(req, res);
      if (method === 'POST') return await addSuggestionReply(req, res);
    }

    // Vote suggestion route
    const voteSuggestionMatch = url.match(/^\/api\/feedback\/suggestions\/([a-zA-Z0-9_-]+)\/vote$/);
    if (voteSuggestionMatch && method === 'POST') {
      req.params = { id: voteSuggestionMatch[1] };
      return await voteSuggestion(req, res);
    }

    // Like comment route
    const likeCommentMatch = url.match(/^\/api\/feedback\/comments\/([a-zA-Z0-9_-]+)\/like$/);
    if (likeCommentMatch && method === 'POST') {
      req.params = { id: likeCommentMatch[1] };
      return await likeComment(req, res);
    }

  // Vote suggestion route (already earlier) - keep ordering

    // Stats route
    if (url === '/api/stats' || url === '/api/feedback/stats') {
      if (method === 'GET') return await getStats(req, res);
    }

    // Public site settings
    if (url === '/api/site-settings') {
      if (method === 'GET') return await getSiteSettings(req, res);
    }

    // Contact form is now handled by api/contact.js

    // 404 for unknown public routes
    return res.status(404).json({ success: false, error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
