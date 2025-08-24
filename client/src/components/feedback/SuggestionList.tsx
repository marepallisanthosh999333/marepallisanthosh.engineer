import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MoreHorizontal,
  ArrowUp
} from 'lucide-react';
import { FeatureSuggestion } from '../../types/feedback';
import { voteSuggestion, hasUserVoted, formatTimestamp } from '../../utils/feedbackService';

interface SuggestionListProps {
  suggestions: FeatureSuggestion[];
  loading: boolean;
  userFingerprint: string;
  onSuggestionsUpdate: () => void;
}

interface SuggestionItemProps {
  suggestion: FeatureSuggestion;
  userFingerprint: string;
  onVoteToggled: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ 
  suggestion, 
  userFingerprint, 
  onVoteToggled 
}) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [localVotes, setLocalVotes] = useState(suggestion.votes);

  useEffect(() => {
    // Check if user has voted for this suggestion
    const checkVoteStatus = async () => {
      try {
        const voted = await hasUserVoted(suggestion.id, userFingerprint);
        setHasVoted(voted);
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };

    checkVoteStatus();
  }, [suggestion.id, userFingerprint]);

  const handleVote = async () => {
    if (isVoting) return;

    try {
      setIsVoting(true);
      const newVotedState = await voteSuggestion(suggestion.id, userFingerprint);
      setHasVoted(newVotedState);
      setLocalVotes(prev => newVotedState ? prev + 1 : prev - 1);
      onVoteToggled();
    } catch (error) {
      console.error('Error toggling vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'in-progress':
        return <MoreHorizontal className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
            {suggestion.isAnonymous ? (
              <User className="w-5 h-5" />
            ) : (
              suggestion.author.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              {suggestion.title}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{suggestion.author}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              {formatTimestamp(suggestion.timestamp)}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`
          flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}
        `}>
          {getStatusIcon(suggestion.status)}
          {suggestion.status}
        </span>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {suggestion.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={handleVote}
          disabled={isVoting}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
            ${hasVoted
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-yellow-900/10'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
          whileHover={!isVoting ? { scale: 1.05 } : {}}
          whileTap={!isVoting ? { scale: 0.95 } : {}}
        >
          <ArrowUp 
            className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} 
          />
          <span className="font-medium">{localVotes}</span>
          <span className="text-xs">
            {localVotes === 1 ? 'vote' : 'votes'}
          </span>
        </motion.button>

        {/* Priority Indicator */}
        {localVotes >= 5 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
            <TrendingUp className="w-3 h-3" />
            Popular
          </div>
        )}
      </div>

      {/* Implementation Note (if completed) */}
      {suggestion.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Feature Implemented!</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            This feature has been successfully added to the portfolio. Thank you for the great suggestion!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const SuggestionList: React.FC<SuggestionListProps> = ({ 
  suggestions, 
  loading, 
  userFingerprint, 
  onSuggestionsUpdate 
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-voted' | 'status'>('most-voted');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filterStatus === 'all') return true;
    return suggestion.status === filterStatus;
  });

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'newest':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'status':
        const statusOrder = { 'completed': 0, 'in-progress': 1, 'pending': 2, 'rejected': 3 };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
      case 'most-voted':
      default:
        return b.votes - a.votes;
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-300 dark:bg-yellow-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-48 h-5 bg-yellow-300 dark:bg-yellow-700 rounded mb-2"></div>
                  <div className="w-32 h-3 bg-yellow-300 dark:bg-yellow-700 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="w-full h-4 bg-yellow-300 dark:bg-yellow-700 rounded"></div>
                <div className="w-3/4 h-4 bg-yellow-300 dark:bg-yellow-700 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-yellow-300 dark:bg-yellow-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No suggestions yet
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Be the first to suggest a new feature!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white"
            >
              <option value="most-voted">Most Voted</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredSuggestions.length} of {suggestions.length} suggestions
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', count: suggestions.length, color: 'bg-gray-100 dark:bg-slate-700' },
          { label: 'Pending', count: suggestions.filter(s => s.status === 'pending').length, color: 'bg-yellow-100 dark:bg-yellow-900/20' },
          { label: 'In Progress', count: suggestions.filter(s => s.status === 'in-progress').length, color: 'bg-blue-100 dark:bg-blue-900/20' },
          { label: 'Completed', count: suggestions.filter(s => s.status === 'completed').length, color: 'bg-green-100 dark:bg-green-900/20' }
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        <div className="space-y-4">
          {sortedSuggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              userFingerprint={userFingerprint}
              onVoteToggled={onSuggestionsUpdate}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Load More Button (for future pagination) */}
      {filteredSuggestions.length >= 10 && (
        <motion.button
          className="w-full py-3 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-600 dark:text-yellow-400 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Load More Suggestions
        </motion.button>
      )}
    </div>
  );
};

export default SuggestionList;
