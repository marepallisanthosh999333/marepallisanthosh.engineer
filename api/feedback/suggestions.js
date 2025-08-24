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
    // Fallback for development
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
      const { title, description, author, email, userFingerprint, isAnonymous } = req.body;

      // Validate required fields
      if (!title || title.trim().length < 5) {
        return res.status(400).json({ error: 'Title must be at least 5 characters long' });
      }

      if (!description || description.trim().length < 20) {
        return res.status(400).json({ error: 'Description must be at least 20 characters long' });
      }

      if (!isAnonymous && (!author || !email)) {
        return res.status(400).json({ error: 'Name and email are required for non-anonymous suggestions' });
      }

      // Create suggestion document
      const suggestionData = {
        title: title.trim(),
        description: description.trim(),
        author: author || 'Anonymous',
        email: isAnonymous ? '' : email,
        userFingerprint: userFingerprint || 'unknown',
        isAnonymous: Boolean(isAnonymous),
        timestamp: new Date(),
        votes: 0,
        status: 'pending',
        approved: false, // Suggestions need approval
      };

      // Save to Firestore
      const docRef = await adminDb.collection('suggestions').add(suggestionData);

      // Send notification email (optional)
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Portfolio Feedback <feedback@marepallisanthosh.engineer>',
              to: ['marepallisanthosh999333@gmail.com'],
              subject: `New Feature Suggestion: ${title}`,
              html: `
                <h2>New Feature Suggestion</h2>
                <p><strong>From:</strong> ${isAnonymous ? 'Anonymous User' : `${author} (${email})`}</p>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong></p>
                <blockquote style="border-left: 4px solid #10b981; padding-left: 16px; margin: 16px 0;">
                  ${description}
                </blockquote>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><em>Please review and approve this suggestion in your admin dashboard.</em></p>
              `,
            }),
          });
        } catch (emailError) {
          console.log('Email notification failed:', emailError);
        }
      }

      res.status(201).json({ 
        success: true, 
        message: 'Suggestion submitted successfully',
        id: docRef.id 
      });

    } catch (error) {
      console.error('Error saving suggestion:', error);
      res.status(500).json({ error: 'Failed to save suggestion' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get approved suggestions
      const suggestionsSnapshot = await adminDb
        .collection('suggestions')
        .where('approved', '==', true)
        .orderBy('votes', 'desc')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const suggestions = suggestionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));

      res.status(200).json({ suggestions });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
