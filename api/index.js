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

// Initialize Firebase
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

    if (db) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase timeout')), 3000)
        );
        
        const savePromise = addDoc(collection(db, 'comments'), commentData);
        const docRef = await Promise.race([savePromise, timeoutPromise]);
        
        return res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...commentData },
          message: 'Comment saved successfully!'
        });
        
      } catch (firebaseError) {
        console.log('⚠️ Firebase error, using demo mode:', firebaseError.message);
      }
    }

    const demoId = 'demo-' + Date.now();
    res.status(201).json({ 
      success: true, 
      data: { id: demoId, ...commentData },
      message: 'Comment received successfully! (Demo mode)'
    });

  } catch (error) {
    console.error('❌ Error saving comment:', error);
    res.status(500).json({ success: false, error: 'Failed to save comment' });
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

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'suggestions'), suggestionData);
        return res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...suggestionData }
        });
      } catch (firebaseError) {
        console.log('⚠️ Firebase error for suggestion:', firebaseError.message);
      }
    }

    const demoId = 'demo-' + Date.now();
    res.status(201).json({ 
      success: true, 
      data: { id: demoId, ...suggestionData },
      message: 'Suggestion received successfully! (Demo mode)'
    });
    
  } catch (error) {
    console.error('Error adding suggestion:', error);
    res.status(500).json({ success: false, error: 'Failed to add suggestion' });
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
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  // Route handling
  try {
    // Comments routes
    if (url === '/api/comments' || url === '/api/feedback/comments') {
      if (method === 'GET') return getComments(req, res);
      if (method === 'POST') return addComment(req, res);
    }

    // Suggestions routes  
    if (url === '/api/suggestions' || url === '/api/feedback/suggestions') {
      if (method === 'GET') return getSuggestions(req, res);
      if (method === 'POST') return addSuggestion(req, res);
    }

    // Stats route
    if (url === '/api/stats' || url === '/api/feedback/stats') {
      if (method === 'GET') return getStats(req, res);
    }

    // Contact form route (existing)
    if (url === '/api/contact') {
      if (method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ 
          message: "Name, email, and message are required" 
        });
      }

      const emailData = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: ["marepallisanthosh999333@gmail.com"],
        subject: `Portfolio Contact from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });

      console.log("Email sent successfully:", emailData);
      return res.json({ message: "Email sent successfully!" });
    }

    // 404 for unknown routes
    return res.status(404).json({ 
      success: false, 
      error: 'Route not found' 
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
