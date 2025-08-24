import "dotenv/config";
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase.js';

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
      // Get all suggestions
      const { 
        limit: limitParam = '50', 
        orderBy: orderByParam = 'votes',
        status: statusFilter = 'all'
      } = req.query;
      
      const suggestionsRef = collection(db, 'suggestions');
      let q = query(suggestionsRef);
      
      // Apply status filter
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      
      // Apply ordering
      if (orderByParam === 'votes') {
        q = query(q, orderBy('votes', 'desc'));
      } else if (orderByParam === 'timestamp') {
        q = query(q, orderBy('timestamp', 'desc'));
      }
      
      // Apply limit
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
    } else if (req.method === 'POST') {
      // Add new suggestion
      const {
        title,
        description,
        author,
        email,
        isAnonymous,
        userFingerprint
      } = req.body;

      // Validation
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

      // Check rate limiting (max 5 suggestions per day per fingerprint)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const recentSuggestionsQuery = query(
        collection(db, 'suggestions'),
        where('userFingerprint', '==', userFingerprint),
        where('timestamp', '>=', today),
        where('timestamp', '<', tomorrow)
      );
      
      const recentSnapshot = await getDocs(recentSuggestionsQuery);
      
      if (recentSnapshot.size >= 5) {
        return res.status(429).json({ 
          success: false, 
          error: 'Rate limit exceeded. Maximum 5 suggestions per day.' 
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

      const docRef = await addDoc(collection(db, 'suggestions'), suggestionData);
      
      res.status(201).json({ 
        success: true, 
        data: { id: docRef.id, ...suggestionData }
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in suggestions API:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
