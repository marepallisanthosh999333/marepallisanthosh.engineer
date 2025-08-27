// Minimal Firestore admin test
// Reads FIREBASE_SERVICE_ACCOUNT_JSON from the environment, initializes
// firebase-admin, and writes a test document to collection 'debug-tests'.

const admin = require('firebase-admin');

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON not found in env');
    process.exit(1);
  }
  let cred;
  try {
    cred = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    process.exit(2);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(cred),
    });
  } catch (e) {
    // ignore if already initialized
    if (!/already exists/u.test(String(e))) throw e;
  }

  const db = admin.firestore();

  try {
    const res = await db.collection('debug-tests').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      note: 'admin test write from local script',
      pid: process.pid,
    });
    console.log('WROTE_OK id=' + res.id);
    process.exit(0);
  } catch (err) {
    console.error('WRITE_ERROR:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(3);
  }
}

main();
