import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

// Initialize Firebase (client-side config)
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

// Get all comments
export const getComments = async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({ comments: [] });
    }

    // Get approved comments
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

// Add new comment
export const addComment = async (req, res) => {
  try {
    const { author, email, content, rating, type, userFingerprint, isAnonymous } = req.body;

    // Validation
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
      approved: true, // Auto-approve for now
    };

    // Try Firebase with timeout, fallback to demo mode immediately if issues
    let firebaseSuccess = false;
    
    if (db) {
      try {
        // Set a short timeout for Firebase operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase timeout')), 3000)
        );
        
        const savePromise = addDoc(collection(db, 'comments'), commentData);
        
        const docRef = await Promise.race([savePromise, timeoutPromise]);
        firebaseSuccess = true;
        
        console.log('✅ Comment saved to Firebase:', docRef.id);
        return res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...commentData },
          message: 'Comment saved successfully!'
        });
        
      } catch (firebaseError) {
        console.log('⚠️ Firebase error, using demo mode:', firebaseError.message);
        // Continue to demo mode fallback below
      }
    }

    // Demo mode fallback (immediate response)
    const demoId = 'demo-' + Date.now();
    console.log('📝 Comment received in demo mode:', commentData);
    
    res.status(201).json({ 
      success: true, 
      data: { id: demoId, ...commentData },
      message: 'Comment received successfully! (Demo mode - Firebase setup in progress)'
    });

  } catch (error) {
    console.error('❌ Error saving comment:', error);
    res.status(500).json({ success: false, error: 'Failed to save comment' });
  }
};

// Toggle like on comment (placeholder)
export const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    // This would implement like/unlike functionality
    res.json({ success: true, message: 'Like feature not implemented yet' });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
};

// Check if user has liked comment (placeholder)
export const checkCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    // This would check if user has liked the comment
    res.json({ success: true, liked: false });
  } catch (error) {
    console.error('Error checking comment like:', error);
    res.status(500).json({ success: false, error: 'Failed to check like status' });
  }
};
