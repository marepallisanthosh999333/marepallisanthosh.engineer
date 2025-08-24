export interface Comment {
  id: string;
  author: string;
  email?: string;
  content: string;
  rating?: number;
  timestamp: Date;
  likes: number;
  approved: boolean;
  type: 'feedback' | 'suggestion' | 'general';
  projectId?: string;
  userFingerprint?: string;
  isAnonymous: boolean;
  githubUsername?: string;
  avatarUrl?: string;
}

export interface Like {
  id: string;
  commentId: string;
  userFingerprint: string;
  timestamp: Date;
}

export interface FeatureSuggestion {
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

export interface FeedbackStats {
  totalComments: number;
  totalSuggestions: number;
  totalLikes: number;
  recentActivity: number;
}

export type FeedbackType = 'feedback' | 'suggestion' | 'general';
