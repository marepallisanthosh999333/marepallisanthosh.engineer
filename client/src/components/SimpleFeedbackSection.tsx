import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Star, Send, ThumbsUp, Lightbulb } from 'lucide-react';

const SimpleFeedbackSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comments' | 'suggestions'>('comments');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert(`Thank you for your ${rating}-star feedback! (Demo mode - Firebase connection required for full functionality)`);
      setComment('');
      setRating(0);
      setName('');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="feedback" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Feedback Matters
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help me improve by sharing your thoughts, suggestions, or rating your experience with my portfolio.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === 'comments'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Comments & Ratings
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Feature Suggestions
            </button>
          </div>

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Leave a Comment & Rating
              </h3>
              
              <form onSubmit={handleSubmitComment} className="space-y-6">
                {/* Anonymous Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                    Comment anonymously
                  </label>
                </div>

                {/* Name and Email */}
                {!isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your name"
                        required={!isAnonymous}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="your.email@example.com"
                        required={!isAnonymous}
                      />
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Share your thoughts about my portfolio..."
                    required
                    minLength={10}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !comment.trim() || rating === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center py-12"
            >
              <Lightbulb className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Feature Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Have ideas for new features or improvements? Let me know!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <p className="text-blue-700 dark:text-blue-300">
                  💡 This feature will be available once Firebase is fully configured.<br/>
                  For now, you can share suggestions via the contact form or email.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              🔧 <strong>Demo Mode:</strong> This feedback system is ready to use! 
              Once Firebase is connected, comments will be saved and you'll receive email notifications.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SimpleFeedbackSection;
