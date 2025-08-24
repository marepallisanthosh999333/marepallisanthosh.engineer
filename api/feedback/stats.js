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
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'marepalli-santhosh-portfolio',
    });
  }
}

export const adminDb = getFirestore();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Get feedback statistics
      const [commentsSnapshot, suggestionsSnapshot, likesSnapshot] = await Promise.all([
        adminDb.collection('comments').where('approved', '==', true).get(),
        adminDb.collection('suggestions').where('approved', '==', true).get(),
        adminDb.collection('likes').get()
      ]);

      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentCommentsSnapshot = await adminDb
        .collection('comments')
        .where('approved', '==', true)
        .where('timestamp', '>=', sevenDaysAgo)
        .get();

      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;
      commentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.rating) {
          totalRating += data.rating;
          ratingCount++;
        }
      });

      const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

      const stats = {
        totalComments: commentsSnapshot.size,
        totalSuggestions: suggestionsSnapshot.size,
        totalLikes: likesSnapshot.size,
        recentActivity: recentCommentsSnapshot.size,
        averageRating: parseFloat(averageRating),
        lastUpdated: new Date().toISOString(),
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      res.status(500).json({ error: 'Failed to fetch feedback statistics' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
