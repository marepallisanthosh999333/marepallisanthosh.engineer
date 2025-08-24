import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, limit, where, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Get all feature suggestions
export const getSuggestions = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

// Add new feature suggestion
export const addSuggestion = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error adding suggestion:', error);
    res.status(500).json({ success: false, error: 'Failed to add suggestion' });
  }
};

// Vote/unvote on suggestion
export const toggleSuggestionVote = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userFingerprint } = req.body;

    if (!userFingerprint) {
      return res.status(400).json({ 
        success: false, 
        error: 'User fingerprint required' 
      });
    }

    // Check if user has already voted
    const votesQuery = query(
      collection(db, 'suggestion_votes'),
      where('suggestionId', '==', suggestionId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const votesSnapshot = await getDocs(votesQuery);
    const hasVoted = !votesSnapshot.empty;

    // Get suggestion document
    const suggestionRef = doc(db, 'suggestions', suggestionId);
    const suggestionDoc = await getDoc(suggestionRef);
    
    if (!suggestionDoc.exists()) {
      return res.status(404).json({ 
        success: false, 
        error: 'Suggestion not found' 
      });
    }

    const currentVotes = suggestionDoc.data()?.votes || 0;
    const voters = suggestionDoc.data()?.voters || [];

    if (hasVoted) {
      // Remove vote
      const voteDoc = votesSnapshot.docs[0];
      await deleteDoc(voteDoc.ref);
      
      // Update suggestion
      await updateDoc(suggestionRef, {
        votes: Math.max(0, currentVotes - 1),
        voters: voters.filter(v => v !== userFingerprint)
      });
      
      res.json({ success: true, voted: false, newVoteCount: Math.max(0, currentVotes - 1) });
    } else {
      // Add vote
      await addDoc(collection(db, 'suggestion_votes'), {
        suggestionId,
        userFingerprint,
        timestamp: new Date()
      });
      
      // Update suggestion
      await updateDoc(suggestionRef, {
        votes: currentVotes + 1,
        voters: [...voters, userFingerprint]
      });
      
      res.json({ success: true, voted: true, newVoteCount: currentVotes + 1 });
    }
  } catch (error) {
    console.error('Error toggling suggestion vote:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle vote' });
  }
};

// Check if user has voted on a suggestion
export const checkSuggestionVote = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userFingerprint } = req.query;

    if (!userFingerprint) {
      return res.status(400).json({ 
        success: false, 
        error: 'User fingerprint required' 
      });
    }

    const votesQuery = query(
      collection(db, 'suggestion_votes'),
      where('suggestionId', '==', suggestionId),
      where('userFingerprint', '==', userFingerprint)
    );
    
    const votesSnapshot = await getDocs(votesQuery);
    const hasVoted = !votesSnapshot.empty;

    res.json({ success: true, voted: hasVoted });
  } catch (error) {
    console.error('Error checking suggestion vote:', error);
    res.status(500).json({ success: false, error: 'Failed to check vote status' });
  }
};

// Update suggestion status (admin only)
export const updateSuggestionStatus = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { status, adminNotes, priority } = req.body;

    // In a real app, you'd check admin authentication here
    // For now, we'll allow any status update

    const validStatuses = ['pending', 'in-progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }

    const suggestionRef = doc(db, 'suggestions', suggestionId);
    const updateData = {
      status,
      lastUpdated: new Date()
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    await updateDoc(suggestionRef, updateData);
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};
