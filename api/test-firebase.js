import "dotenv/config";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config/firebase.js';

async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test read
    const commentsRef = collection(db, 'comments');
    const snapshot = await getDocs(commentsRef);
    console.log(`✅ Read test: Found ${snapshot.size} comments`);
    
    // Test write
    const testDoc = await addDoc(commentsRef, {
      author: 'Test User',
      content: 'Firebase connection test',
      rating: 5,
      timestamp: new Date(),
      approved: true,
      type: 'test'
    });
    
    console.log(`✅ Write test: Created document ${testDoc.id}`);
    console.log('🎉 Firebase is working perfectly!');
    
  } catch (error) {
    console.error('❌ Firebase error:', error.message);
    console.error('📋 Error details:', error);
  }
}

testFirebase();
