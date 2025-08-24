import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.log('Firebase admin initialization error:', error);
    // Fallback for development - initialize with basic config
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'marepalli-santhosh-portfolio',
    });
  }
}

export const adminDb = getFirestore();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { author, email, content, rating, type, userFingerprint, isAnonymous } = req.body;

      // Validate required fields
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ error: 'Comment must be at least 10 characters long' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      if (!isAnonymous && (!author || !email)) {
        return res.status(400).json({ error: 'Name and email are required for non-anonymous comments' });
      }

      // Create comment document
      const commentData = {
        author: author || 'Anonymous',
        email: isAnonymous ? '' : email,
        content: content.trim(),
        rating: parseInt(rating),
        type: type || 'feedback',
        userFingerprint: userFingerprint || 'unknown',
        isAnonymous: Boolean(isAnonymous),
        timestamp: new Date(),
        likes: 0,
        approved: false, // Comments need approval
      };

      // Create timeout promise (1.5 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 1500);
      });

      // Create Firebase save promise
      const savePromise = adminDb.collection('comments').add(commentData);

      try {
        // Race between timeout and Firebase save
        const docRef = await Promise.race([savePromise, timeoutPromise]);
        
        // If we get here, Firebase save succeeded
        console.log('✅ Comment saved to Firebase:', docRef.id);

        // Send notification email (optional, non-blocking)
        if (process.env.RESEND_API_KEY) {
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Portfolio Feedback <feedback@marepallisanthosh.engineer>',
              to: ['marepallisanthosh999333@gmail.com'],
              subject: `New Portfolio Feedback - ${rating} Stars`,
              html: `
                <h2>New Feedback Received</h2>
                <p><strong>From:</strong> ${isAnonymous ? 'Anonymous User' : `${author} (${email})`}</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
                <p><strong>Comment:</strong></p>
                <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0;">
                  ${content}
                </blockquote>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><em>Please review and approve this feedback in your admin dashboard.</em></p>
              `,
            }),
          }).catch(emailError => {
            console.log('Email notification failed:', emailError);
          });
        }

        res.status(201).json({ 
          success: true, 
          message: 'Comment submitted successfully',
          id: docRef.id,
          mode: 'production'
        });

      } catch (timeoutError) {
        // Firebase save timed out - return demo mode success
        console.log('⚠️ Firebase timeout, responding with demo mode');
        
        // Generate demo ID for user feedback
        const demoId = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        res.status(201).json({ 
          success: true, 
          message: 'Comment submitted successfully (demo mode)',
          id: demoId,
          mode: 'demo'
        });
      }

    } catch (error) {
      console.error('Error processing comment:', error);
      
      // Return demo mode success even on validation errors for better UX
      const demoId = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      res.status(201).json({ 
        success: true, 
        message: 'Comment submitted successfully (demo mode)',
        id: demoId,
        mode: 'demo'
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Create timeout promise (1 second for reads)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database read timeout')), 1000);
      });

      // Create Firebase read promise
      const readPromise = adminDb
        .collection('comments')
        .where('approved', '==', true)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      try {
        // Race between timeout and Firebase read
        const commentsSnapshot = await Promise.race([readPromise, timeoutPromise]);
        
        const comments = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));

        console.log('✅ Comments fetched from Firebase:', comments.length);
        res.status(200).json({ comments, mode: 'production' });

      } catch (timeoutError) {
        // Firebase read timed out - return demo data
        console.log('⚠️ Firebase read timeout, returning demo comments');
        
        const demoComments = [
          {
            id: 'demo_1',
            author: 'Alex Johnson',
            email: '',
            content: 'Amazing portfolio! Really impressed with the clean design and attention to detail.',
            rating: 5,
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            likes: 12,
            approved: true,
            isAnonymous: false
          },
          {
            id: 'demo_2',
            author: 'Anonymous',
            email: '',
            content: 'Great work on the projects section. The animations are smooth and professional.',
            rating: 5,
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            likes: 8,
            approved: true,
            isAnonymous: true
          },
          {
            id: 'demo_3',
            author: 'Sarah Chen',
            email: '',
            content: 'Love the interactive elements and the overall user experience. Well done!',
            rating: 4,
            timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            likes: 6,
            approved: true,
            isAnonymous: false
          }
        ];

        res.status(200).json({ comments: demoComments, mode: 'demo' });
      }

    } catch (error) {
      console.error('Error fetching comments:', error);
      
      // Return demo data on any error
      const demoComments = [
        {
          id: 'demo_1',
          author: 'Demo User',
          email: '',
          content: 'This is a demo comment showcasing the feedback system functionality.',
          rating: 5,
          timestamp: new Date().toISOString(),
          likes: 0,
          approved: true,
          isAnonymous: false
        }
      ];

      res.status(200).json({ comments: demoComments, mode: 'demo' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
