/*
Temporary test script — creates a comment via Admin SDK and approves it via the local API approval endpoint.
Usage: set FIREBASE_SERVICE_ACCOUNT_JSON (or PATH) and ADMIN_API_KEY in env, then run:
  node scripts/test_comment_approve.cjs
This script is temporary and will be removed after testing.
*/

const admin = require('firebase-admin');
const fetch = require('node-fetch');
const fs = require('fs');

async function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) return JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8'));
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) return JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
  throw new Error('No service account env set');
}

(async function main(){
  try {
    const sa = await loadServiceAccount();
    try {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } catch (e) {
      if (!/already exists/u.test(String(e))) throw e;
    }
    const db = admin.firestore();

    const commentData = {
      author: 'Local Test',
      email: 'test@example.com',
      content: 'This is a temporary test comment created by test script',
      rating: 5,
      type: 'feedback',
      userFingerprint: 'local-test',
      isAnonymous: false,
      timestamp: new Date(),
      likes: 0,
      approved: false,
    };

    const docRef = await db.collection('comments').add(commentData);
    console.log('Created test comment id=', docRef.id);

    // Call local approval endpoint
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) {
      console.error('ADMIN_API_KEY not set; cannot call approval endpoint');
      process.exit(1);
    }

    const localUrl = process.env.LOCAL_API_URL || 'http://localhost:3000';
    const approveUrl = `${localUrl}/api/comments/${docRef.id}/approve`;
    console.log('Calling approve URL:', approveUrl);

    const resp = await fetch(approveUrl, {
      method: 'POST',
      headers: { 'x-admin-api-key': adminKey }
    });

    const result = await resp.json();
    console.log('Approve response status:', resp.status, 'body:', result);

    const finalDoc = await db.collection('comments').doc(docRef.id).get();
    console.log('Final doc approved?', finalDoc.data());

    process.exit(0);
  } catch (err) {
    console.error('Test script failed:', err);
    process.exit(2);
  }
})();
