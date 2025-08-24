import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  increment,
  serverTimestamp,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Comment, Like, FeatureSuggestion, FeedbackStats } from '../types/feedback';

// Generate browser fingerprint for anonymous users
export const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 16);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Submit a new comment
export const submitComment = async (commentData: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'approved'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      timestamp: serverTimestamp(),
      likes: 0,
      approved: false // Comments need approval by default
    });
    
    // Send notification email to admin
    await sendNotificationEmail('comment', commentData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw new Error('Failed to submit comment');
  }
};

// Submit a feature suggestion
export const submitSuggestion = async (suggestionData: Omit<FeatureSuggestion, 'id' | 'timestamp' | 'votes' | 'approved' | 'status'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'suggestions'), {
      ...suggestionData,
      timestamp: serverTimestamp(),
      votes: 0,
      approved: false,
      status: 'pending'
    });
    
    // Send notification email to admin
    await sendNotificationEmail('suggestion', suggestionData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    throw new Error('Failed to submit suggestion');
  }
};

// Get approved comments
export const getApprovedComments = async (type?: string, projectId?: string): Promise<Comment[]> => {
  try {
    let q = query(
      collection(db, 'comments'),
      where('approved', '==', true),
      orderBy('timestamp', 'desc')
    );
    
    if (type) {
      q = query(
        collection(db, 'comments'),
        where('approved', '==', true),
        where('type', '==', type),
        orderBy('timestamp', 'desc')
      );
    }
    
    if (projectId) {
      q = query(
        collection(db, 'comments'),
        where('approved', '==', true),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Get approved suggestions
export const getApprovedSuggestions = async (): Promise<FeatureSuggestion[]> => {
  try {
    const q = query(
      collection(db, 'suggestions'),
      where('approved', '==', true),
      orderBy('votes', 'desc'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as FeatureSuggestion[];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Like/unlike a comment
export const toggleLike = async (commentId: string, userFingerprint: string): Promise<boolean> => {
  try {
    // Check if user already liked this comment
    const likesQuery = query(
      collection(db, 'likes'),
      where('commentId', '==', commentId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const existingLikes = await getDocs(likesQuery);
    
    if (existingLikes.empty) {
      // Add like
      await addDoc(collection(db, 'likes'), {
        commentId,
        userFingerprint,
        timestamp: serverTimestamp()
      });
      
      // Increment comment likes count
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1)
      });
      
      return true; // Liked
    } else {
      // Remove like
      await deleteDoc(existingLikes.docs[0].ref);
      
      // Decrement comment likes count
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(-1)
      });
      
      return false; // Unliked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error('Failed to toggle like');
  }
};

// Vote for a suggestion
export const voteSuggestion = async (suggestionId: string, userFingerprint: string): Promise<boolean> => {
  try {
    // Check if user already voted for this suggestion
    const votesQuery = query(
      collection(db, 'suggestion_votes'),
      where('suggestionId', '==', suggestionId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const existingVotes = await getDocs(votesQuery);
    
    if (existingVotes.empty) {
      // Add vote
      await addDoc(collection(db, 'suggestion_votes'), {
        suggestionId,
        userFingerprint,
        timestamp: serverTimestamp()
      });
      
      // Increment suggestion votes count
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        votes: increment(1)
      });
      
      return true; // Voted
    } else {
      // Remove vote
      await deleteDoc(existingVotes.docs[0].ref);
      
      // Decrement suggestion votes count
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        votes: increment(-1)
      });
      
      return false; // Unvoted
    }
  } catch (error) {
    console.error('Error voting suggestion:', error);
    throw new Error('Failed to vote suggestion');
  }
};

// Check if user has liked a comment
export const hasUserLiked = async (commentId: string, userFingerprint: string): Promise<boolean> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('commentId', '==', commentId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const existingLikes = await getDocs(likesQuery);
    return !existingLikes.empty;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// Check if user has voted for a suggestion
export const hasUserVoted = async (suggestionId: string, userFingerprint: string): Promise<boolean> => {
  try {
    const votesQuery = query(
      collection(db, 'suggestion_votes'),
      where('suggestionId', '==', suggestionId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const existingVotes = await getDocs(votesQuery);
    return !existingVotes.empty;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

// Get feedback statistics
export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  try {
    const [commentsSnapshot, suggestionsSnapshot, likesSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'comments'), where('approved', '==', true))),
      getDocs(query(collection(db, 'suggestions'), where('approved', '==', true))),
      getDocs(collection(db, 'likes'))
    ]);
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCommentsQuery = query(
      collection(db, 'comments'),
      where('approved', '==', true),
      where('timestamp', '>=', sevenDaysAgo)
    );
    const recentCommentsSnapshot = await getDocs(recentCommentsQuery);
    
    return {
      totalComments: commentsSnapshot.size,
      totalSuggestions: suggestionsSnapshot.size,
      totalLikes: likesSnapshot.size,
      recentActivity: recentCommentsSnapshot.size
    };
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return {
      totalComments: 0,
      totalSuggestions: 0,
      totalLikes: 0,
      recentActivity: 0
    };
  }
};

// Send notification email to admin
const sendNotificationEmail = async (type: 'comment' | 'suggestion', data: any): Promise<void> => {
  try {
    const response = await fetch('/api/feedback/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send notification email');
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// Format timestamp for display
export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
};
