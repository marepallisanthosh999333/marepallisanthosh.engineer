import "dotenv/config";
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { sendCommentNotification } from '../utils/emailService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all comments
      const { limit: limitParam = '50', orderBy: orderByParam = 'timestamp' } = req.query;
      
      const commentsRef = collection(db, 'comments');
      let q = query(commentsRef, orderBy(orderByParam, 'desc'));
      
      if (limitParam && limitParam !== 'all') {
        q = query(q, limit(parseInt(limitParam)));
      }
      
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      res.json({ success: true, data: comments });
    } else if (req.method === 'POST') {
      // Add new comment
      const {
        name,
        email,
        comment,
        rating,
        isAnonymous,
        userFingerprint
      } = req.body;

      // Validation
      if (!comment || !rating || !userFingerprint) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }

      if (!isAnonymous && (!name || !email)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and email required for non-anonymous comments' 
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'Rating must be between 1 and 5' 
        });
      }

      // Check rate limiting (max 3 comments per day per fingerprint)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const recentCommentsQuery = query(
        collection(db, 'comments'),
        where('userFingerprint', '==', userFingerprint),
        where('timestamp', '>=', today),
        where('timestamp', '<', tomorrow)
      );
      
      const recentSnapshot = await getDocs(recentCommentsQuery);
      
      if (recentSnapshot.size >= 3) {
        return res.status(429).json({ 
          success: false, 
          error: 'Rate limit exceeded. Maximum 3 comments per day.' 
        });
      }

      const commentData = {
        author: isAnonymous ? 'Anonymous User' : name,
        email: isAnonymous ? null : email,
        content: comment,
        rating: parseInt(rating),
        isAnonymous: Boolean(isAnonymous),
        userFingerprint,
        timestamp: new Date(),
        status: 'approved',
        likes: 0,
        replies: []
      };

      const docRef = await addDoc(collection(db, 'comments'), commentData);
      
      // Send notification email
      try {
        await sendCommentNotification({
          id: docRef.id,
          ...commentData
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      res.status(201).json({ 
        success: true, 
        data: { id: docRef.id, ...commentData }
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in comments API:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
