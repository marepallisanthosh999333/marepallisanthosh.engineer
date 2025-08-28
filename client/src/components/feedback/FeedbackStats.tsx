import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Lightbulb, 
  Users, 
  Calendar,
  ThumbsUp,
  Activity,
  Star,
  Clock,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Comment, FeatureSuggestion } from '../../types/feedback';

interface FeedbackStatsProps {
  comments: Comment[];
  suggestions: FeatureSuggestion[];
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${color} rounded-xl p-6 relative overflow-hidden`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
            {Math.abs(trend.value)}% from last week
          </div>
        )}
      </div>
      <div className="text-gray-400 dark:text-gray-500">
        {icon}
      </div>
    </div>
  </motion.div>
);

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, maxValue, color }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs text-gray-600 dark:text-gray-400 text-right">
        {label}
      </div>
      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <div className="w-8 text-xs text-gray-600 dark:text-gray-400 text-right">
        {value}
      </div>
    </div>
  );
};

const FeedbackStats: React.FC<FeedbackStatsProps> = ({ 
  comments, 
  suggestions, 
  loading 
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Filter data based on time range
  const getFilteredData = (items: any[]) => {
    if (timeRange === 'all') return items;
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : 30;
    const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return items.filter(item => item.timestamp >= cutoff);
  };

  const filteredComments = getFilteredData(comments);
  const filteredSuggestions = getFilteredData(suggestions);

  // Calculate statistics
  const stats = {
    totalComments: filteredComments.length,
    totalSuggestions: filteredSuggestions.length,
    totalVotes: filteredSuggestions.reduce((sum, s) => sum + s.votes, 0),
    averageRating: filteredComments.length > 0 
      ? (filteredComments.reduce((sum, c) => sum + c.rating, 0) / filteredComments.length).toFixed(1)
      : '0.0',
    completedSuggestions: suggestions.filter(s => s.status === 'completed').length,
    inProgressSuggestions: suggestions.filter(s => s.status === 'in-progress').length,
    pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
    rejectedSuggestions: suggestions.filter(s => s.status === 'rejected').length,
    highRatingComments: filteredComments.filter(c => c.rating >= 4).length,
    uniqueUsers: new Set([
      ...filteredComments.map(c => c.isAnonymous ? 'anonymous' : c.author),
      ...filteredSuggestions.map(s => s.isAnonymous ? 'anonymous' : s.author)
    ]).size
  };

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: filteredComments.filter(c => c.rating === rating).length
  }));

  const maxRatingCount = Math.max(...ratingDistribution.map(r => r.count), 1);

  // Activity over time (simple daily aggregation)
  const getActivityData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const activityData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayComments = comments.filter(c => 
        c.timestamp >= date && c.timestamp < nextDate
      ).length;
      
      const daySuggestions = suggestions.filter(s => 
        s.timestamp >= date && s.timestamp < nextDate
      ).length;
      
      activityData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: dayComments,
        suggestions: daySuggestions,
        total: dayComments + daySuggestions
      });
    }
    
    return activityData;
  };

  const activityData = getActivityData();
  const maxActivity = Math.max(...activityData.map(d => d.total), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-slate-700 rounded-xl h-32"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-slate-700 rounded-xl h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Time range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Comments"
          value={stats.totalComments}
          subtitle="User feedback received"
          icon={<MessageSquare className="w-6 h-6" />}
          color="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
        />
        
        <StatCard
          title="Feature Suggestions"
          value={stats.totalSuggestions}
          subtitle="Ideas submitted"
          icon={<Lightbulb className="w-6 h-6" />}
          color="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
        />
        
        <StatCard
          title="Total Votes"
          value={stats.totalVotes}
          subtitle="Community engagement"
          icon={<ThumbsUp className="w-6 h-6" />}
          color="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
        />
        
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating}/5`}
          subtitle={`${stats.highRatingComments} positive reviews`}
          icon={<Star className="w-6 h-6" />}
          color="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Users"
          value={stats.uniqueUsers}
          subtitle="Unique contributors"
          icon={<Users className="w-5 h-5" />}
          color="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800"
        />
        
        <StatCard
          title="Completed Features"
          value={stats.completedSuggestions}
          subtitle="Successfully implemented"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800"
        />
        
        <StatCard
          title="Implementation Rate"
          value={`${suggestions.length > 0 ? Math.round((stats.completedSuggestions / suggestions.length) * 100) : 0}%`}
          subtitle="Features delivered"
          icon={<Target className="w-5 h-5" />}
          color="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Rating Distribution
          </h4>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count }) => (
              <ChartBar
                key={rating}
                label={`${rating} ⭐`}
                value={count}
                maxValue={maxRatingCount}
                color="bg-gradient-to-r from-yellow-400 to-yellow-600"
              />
            ))}
          </div>
        </motion.div>

        {/* Suggestion Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Suggestion Status
          </h4>
          <div className="space-y-3">
            <ChartBar
              label="Completed"
              value={stats.completedSuggestions}
              maxValue={Math.max(stats.completedSuggestions, stats.inProgressSuggestions, stats.pendingSuggestions, 1)}
              color="bg-gradient-to-r from-green-400 to-green-600"
            />
            <ChartBar
              label="In Progress"
              value={stats.inProgressSuggestions}
              maxValue={Math.max(stats.completedSuggestions, stats.inProgressSuggestions, stats.pendingSuggestions, 1)}
              color="bg-gradient-to-r from-blue-400 to-blue-600"
            />
            <ChartBar
              label="Pending"
              value={stats.pendingSuggestions}
              maxValue={Math.max(stats.completedSuggestions, stats.inProgressSuggestions, stats.pendingSuggestions, 1)}
              color="bg-gradient-to-r from-yellow-400 to-yellow-600"
            />
            <ChartBar
              label="Rejected"
              value={stats.rejectedSuggestions}
              maxValue={Math.max(stats.completedSuggestions, stats.inProgressSuggestions, stats.pendingSuggestions, 1)}
              color="bg-gradient-to-r from-red-400 to-red-600"
            />
          </div>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Activity Timeline ({timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'All time'})
        </h4>
        
        <div className="space-y-2">
          {activityData.slice(-10).map((day, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-600 dark:text-gray-400 text-right">
                {day.date}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(day.total / maxActivity) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-600"
                />
              </div>
              <div className="w-12 text-xs text-gray-600 dark:text-gray-400 text-right">
                {day.total}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            Comments: {filteredComments.length}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            Suggestions: {filteredSuggestions.length}
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Summary
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            In the {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'total period'}, 
            you've received <strong>{stats.totalComments}</strong> comments and <strong>{stats.totalSuggestions}</strong> feature suggestions.
          </p>
          <p>
            Your average rating is <strong>{stats.averageRating}/5</strong> with <strong>{stats.highRatingComments}</strong> positive reviews.
          </p>
          <p>
            <strong>{stats.completedSuggestions}</strong> suggestions have been implemented, 
            with <strong>{stats.inProgressSuggestions}</strong> currently in development.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackStats;
