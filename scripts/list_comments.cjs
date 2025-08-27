const admin = require('firebase-admin');
const fs = require('fs');

async function main(){
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if(!raw && process.env.FIREBASE_SERVICE_ACCOUNT_PATH){
    raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8');
  }
  if(!raw){
    console.error('No service account available in env or path');
    process.exit(1);
  }
  const cred = JSON.parse(raw);
  try{
    admin.initializeApp({credential: admin.credential.cert(cred)});
  }catch(e){/* ignore if already inited*/}
  const db = admin.firestore();
  const snap = await db.collection('comments').orderBy('timestamp','desc').limit(5).get();
  console.log('Recent comments:');
  snap.forEach(d=>{
    const data = d.data();
    console.log(d.id, JSON.stringify({author:data.author, content: data.content, ts: data.timestamp}, null, 0));
  });
}

main().catch(e=>{console.error(e); process.exit(2)});
