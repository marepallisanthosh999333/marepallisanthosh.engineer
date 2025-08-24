import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, User, Clock, ThumbsUp } from 'lucide-react';
import { Comment } from '../../types/feedback';
import { toggleLike, hasUserLiked, formatTimestamp } from '../../utils/feedbackService';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  userFingerprint: string;
  onCommentsUpdate: () => void;
}

interface CommentItemProps {
  comment: Comment;
  userFingerprint: string;
  onLikeToggled: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, userFingerprint, onLikeToggled }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes);

  useEffect(() => {
    // Check if user has liked this comment
    const checkLikeStatus = async () => {
      try {
        const liked = await hasUserLiked(comment.id, userFingerprint);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [comment.id, userFingerprint]);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newLikedState = await toggleLike(comment.id, userFingerprint);
      setIsLiked(newLikedState);
      setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);
      onLikeToggled();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feedback': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'suggestion': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback': return '💬';
      case 'suggestion': return '💡';
      default: return '📝';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-slate-600"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {comment.isAnonymous ? (
              <User className="w-5 h-5" />
            ) : (
              comment.author.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {comment.author}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {formatTimestamp(comment.timestamp)}
            </div>
          </div>
        </div>

        {/* Type Badge */}
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(comment.type)}
        `}>
          {getTypeIcon(comment.type)} {comment.type}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={handleLike}
          disabled={isLiking}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
            ${isLiked
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-slate-500'
            }
            ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
          whileHover={!isLiking ? { scale: 1.05 } : {}}
          whileTap={!isLiking ? { scale: 0.95 } : {}}
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
          />
          <span className="font-medium">{localLikes}</span>
        </motion.button>

        {/* Project ID if applicable */}
        {comment.projectId && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded">
            Project: {comment.projectId}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  loading, 
  userFingerprint, 
  onCommentsUpdate 
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'most-liked':
        return b.likes - a.likes;
      case 'newest':
      default:
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-slate-600 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-slate-500 rounded-full"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-300 dark:bg-slate-500 rounded mb-2"></div>
                  <div className="w-16 h-3 bg-gray-300 dark:bg-slate-500 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="w-full h-4 bg-gray-300 dark:bg-slate-500 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 dark:bg-slate-500 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-300 dark:bg-slate-500 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-gray-300 dark:bg-slate-500 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No comments yet
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Be the first to share your feedback!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-liked">Most Liked</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userFingerprint={userFingerprint}
              onLikeToggled={onCommentsUpdate}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Load More Button (for future pagination) */}
      {comments.length >= 10 && (
        <motion.button
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Load More Comments
        </motion.button>
      )}
    </div>
  );
};

export default CommentList;
