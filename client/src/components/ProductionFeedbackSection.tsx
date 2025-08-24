import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Star, 
  Send, 
  User, 
  Mail, 
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Clock
} from 'lucide-react';

// Browser fingerprinting function
const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 16);
};

interface Comment {
  id: string;
  author: string;
  email?: string;
  content: string;
  rating?: number;
  timestamp: Date;
  likes: number;
  approved: boolean;
  type: 'feedback' | 'suggestion' | 'general';
  userFingerprint?: string;
  isAnonymous: boolean;
}

interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  author: string;
  email?: string;
  votes: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  timestamp: Date;
  approved: boolean;
  userFingerprint?: string;
  isAnonymous: boolean;
}

interface FeedbackStats {
  totalComments: number;
  totalSuggestions: number;
  totalLikes: number;
  recentActivity: number;
  averageRating?: number;
}

const ProductionFeedbackSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comments' | 'suggestions' | 'stats'>('comments');
  const [userFingerprint, setUserFingerprint] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalComments: 0,
    totalSuggestions: 0,
    totalLikes: 0,
    recentActivity: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(false);

  // Comment Form State
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0,
    isAnonymous: false,
  });
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});

  // Suggestion Form State
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    title: '',
    description: '',
    name: '',
    email: '',
    isAnonymous: false,
  });
  const [suggestionErrors, setSuggestionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setUserFingerprint(generateFingerprint());
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [commentsRes, suggestionsRes, statsRes] = await Promise.all([
        fetch('/api/feedback/comments').catch(() => ({ ok: false } as Response)),
        fetch('/api/feedback/suggestions').catch(() => ({ ok: false } as Response)),
        fetch('/api/feedback/stats').catch(() => ({ ok: false } as Response))
      ]);

      if (commentsRes.ok && 'json' in commentsRes) {
        const data = await commentsRes.json();
        setComments(data.comments || []);
      }

      if (suggestionsRes.ok && 'json' in suggestionsRes) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }

      if (statsRes.ok && 'json' in statsRes) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCommentForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!commentForm.isAnonymous) {
      if (!commentForm.name.trim()) errors.name = 'Name is required';
      if (!commentForm.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(commentForm.email)) {
        errors.email = 'Invalid email format';
      }
    }
    
    if (!commentForm.comment.trim()) {
      errors.comment = 'Comment is required';
    } else if (commentForm.comment.trim().length < 10) {
      errors.comment = 'Comment must be at least 10 characters';
    }
    
    if (commentForm.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    
    setCommentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSuggestionForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!suggestionForm.title.trim()) {
      errors.title = 'Title is required';
    } else if (suggestionForm.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!suggestionForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (suggestionForm.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    
    if (!suggestionForm.isAnonymous) {
      if (!suggestionForm.name.trim()) errors.name = 'Name is required';
      if (!suggestionForm.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suggestionForm.email)) {
        errors.email = 'Invalid email format';
      }
    }
    
    setSuggestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCommentForm()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch('/api/feedback/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: commentForm.isAnonymous ? 'Anonymous' : commentForm.name,
          email: commentForm.isAnonymous ? '' : commentForm.email,
          content: commentForm.comment,
          rating: commentForm.rating,
          type: 'feedback',
          userFingerprint,
          isAnonymous: commentForm.isAnonymous,
        }),
      });
      
      if (response.ok) {
        setCommentForm({
          name: '',
          email: '',
          comment: '',
          rating: 0,
          isAnonymous: false,
        });
        alert('Thank you for your feedback! It will be reviewed and published soon.');
        loadData(); // Refresh data
      } else {
        throw new Error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again later.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSuggestionForm()) return;
    
    setIsSubmittingSuggestion(true);
    
    try {
      const response = await fetch('/api/feedback/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestionForm.title,
          description: suggestionForm.description,
          author: suggestionForm.isAnonymous ? 'Anonymous' : suggestionForm.name,
          email: suggestionForm.isAnonymous ? '' : suggestionForm.email,
          userFingerprint,
          isAnonymous: suggestionForm.isAnonymous,
        }),
      });
      
      if (response.ok) {
        setSuggestionForm({
          title: '',
          description: '',
          name: '',
          email: '',
          isAnonymous: false,
        });
        alert('Thank you for your suggestion! It will be reviewed and published soon.');
        loadData(); // Refresh data
      } else {
        throw new Error('Failed to submit suggestion');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again later.');
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <section id="feedback" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive Feedback Hub
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your voice matters! Share feedback, suggest features, and help shape the future of this portfolio.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <MessageCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <Lightbulb className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSuggestions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Suggestions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Comments & Ratings
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'suggestions'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Feature Suggestions
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Comment Form */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                      Leave a Comment & Rating
                    </h3>

                    <form onSubmit={submitComment} className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="comment-anonymous"
                          checked={commentForm.isAnonymous}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="comment-anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                          Comment anonymously
                        </label>
                      </div>

                      {!commentForm.isAnonymous && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <User className="inline mr-1 h-4 w-4" />
                              Name
                            </label>
                            <input
                              type="text"
                              value={commentForm.name}
                              onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Your name"
                            />
                            {commentErrors.name && (
                              <p className="mt-1 text-sm text-red-600">{commentErrors.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Mail className="inline mr-1 h-4 w-4" />
                              Email
                            </label>
                            <input
                              type="email"
                              value={commentForm.email}
                              onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="your.email@example.com"
                            />
                            {commentErrors.email && (
                              <p className="mt-1 text-sm text-red-600">{commentErrors.email}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rating *
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setCommentForm(prev => ({ ...prev, rating: star }))}
                              className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= commentForm.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {commentErrors.rating && (
                          <p className="mt-1 text-sm text-red-600">{commentErrors.rating}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comment *
                        </label>
                        <textarea
                          value={commentForm.comment}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          placeholder="Share your thoughts about my portfolio..."
                        />
                        {commentErrors.comment && (
                          <p className="mt-1 text-sm text-red-600">{commentErrors.comment}</p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmittingComment}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        {isSubmittingComment ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Feedback</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Comments List */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Comments ({comments.length})
                    </h4>
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No comments yet. Be the first to share your feedback!</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {comment.author}
                                </span>
                                {comment.rating && (
                                  <div className="flex">
                                    {Array.from({ length: comment.rating }, (_, i) => (
                                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                            <div className="flex items-center space-x-2">
                              <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                <Heart className="h-4 w-4" />
                                <span>{comment.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Suggestion Form */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-green-600" />
                      Suggest a Feature
                    </h3>

                    <form onSubmit={submitSuggestion} className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="suggestion-anonymous"
                          checked={suggestionForm.isAnonymous}
                          onChange={(e) => setSuggestionForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="suggestion-anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                          Suggest anonymously
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Feature Title *
                        </label>
                        <input
                          type="text"
                          value={suggestionForm.title}
                          onChange={(e) => setSuggestionForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Dark mode toggle, Project filtering..."
                        />
                        {suggestionErrors.title && (
                          <p className="mt-1 text-sm text-red-600">{suggestionErrors.title}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={suggestionForm.description}
                          onChange={(e) => setSuggestionForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          placeholder="Describe your feature idea in detail..."
                        />
                        {suggestionErrors.description && (
                          <p className="mt-1 text-sm text-red-600">{suggestionErrors.description}</p>
                        )}
                      </div>

                      {!suggestionForm.isAnonymous && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <User className="inline mr-1 h-4 w-4" />
                              Name
                            </label>
                            <input
                              type="text"
                              value={suggestionForm.name}
                              onChange={(e) => setSuggestionForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Your name"
                            />
                            {suggestionErrors.name && (
                              <p className="mt-1 text-sm text-red-600">{suggestionErrors.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Mail className="inline mr-1 h-4 w-4" />
                              Email
                            </label>
                            <input
                              type="email"
                              value={suggestionForm.email}
                              onChange={(e) => setSuggestionForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="your.email@example.com"
                            />
                            {suggestionErrors.email && (
                              <p className="mt-1 text-sm text-red-600">{suggestionErrors.email}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={isSubmittingSuggestion}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        {isSubmittingSuggestion ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4" />
                            <span>Submit Suggestion</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Suggestions List */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Community Suggestions ({suggestions.length})
                    </h4>
                    <div className="space-y-4">
                      {suggestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Lightbulb className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No suggestions yet. Share your ideas to improve this portfolio!</p>
                        </div>
                      ) : (
                        suggestions.map((suggestion) => (
                          <div key={suggestion.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h5>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  suggestion.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  suggestion.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {suggestion.status}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTimestamp(suggestion.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{suggestion.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                by {suggestion.author}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{suggestion.votes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                    Feedback Analytics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-4">
                        <MessageCircle className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{stats.totalComments}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Total Comments</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Feedback from visitors</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-4">
                        <Lightbulb className="h-8 w-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{stats.totalSuggestions}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Feature Suggestions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Ideas for improvement</p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700">
                      <div className="flex items-center justify-between mb-4">
                        <Heart className="h-8 w-8 text-red-600" />
                        <span className="text-2xl font-bold text-red-600">{stats.totalLikes}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Total Likes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Community appreciation</p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center justify-between mb-4">
                        <Star className="h-8 w-8 text-yellow-600" />
                        <span className="text-2xl font-bold text-yellow-600">
                          {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Average Rating</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Out of 5 stars</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between mb-4">
                        <Clock className="h-8 w-8 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">{stats.recentActivity}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Last 7 days</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-gray-600" />
                        <span className="text-2xl font-bold text-gray-600">
                          {stats.totalComments + stats.totalSuggestions}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Total Engagement</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">All interactions</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      💡 Feedback System Status
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Your feedback system is fully operational! All data is stored securely in Firebase 
                      and you receive email notifications for new submissions.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductionFeedbackSection;
