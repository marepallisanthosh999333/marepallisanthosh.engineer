import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lightbulb, User, Mail, FileText, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { submitSuggestion } from '../../utils/feedbackService';

interface SuggestionFormProps {
  onSuggestionSubmitted: () => void;
  userFingerprint: string;
}

interface SuggestionFormData {
  title: string;
  description: string;
  author?: string;
  email?: string;
  isAnonymous: boolean;
}

const schema = yup.object().shape({
  title: yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),
  author: yup.string().when('isAnonymous', {
    is: false,
    then: (schema) => schema.required('Name is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  email: yup.string().when('isAnonymous', {
    is: false,
    then: (schema) => schema.email('Invalid email format'),
    otherwise: (schema) => schema.notRequired()
  }),
  isAnonymous: yup.boolean().required()
});

const SuggestionForm: React.FC<SuggestionFormProps> = ({ 
  onSuggestionSubmitted, 
  userFingerprint 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<SuggestionFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      isAnonymous: false
    }
  });

  const isAnonymous = watch('isAnonymous');
  const title = watch('title');
  const description = watch('description');

  const onSubmit = async (data: SuggestionFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const suggestionData = {
        title: data.title,
        description: data.description,
        author: data.isAnonymous ? 'Anonymous' : (data.author || 'Anonymous'),
        email: data.isAnonymous ? undefined : data.email,
        userFingerprint,
        isAnonymous: data.isAnonymous
      };

      await submitSuggestion(suggestionData);
      
      setIsSubmitted(true);
      reset();
      onSuggestionSubmitted();
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="relative">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
          <Sparkles className="w-4 h-4 text-yellow-300 absolute bottom-2 left-1/3 animate-pulse delay-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Great Idea!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Your feature suggestion has been submitted and is under review. 
          Thank you for helping make this portfolio better!
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Anonymous Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isAnonymous"
          {...register('isAnonymous')}
          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
        />
        <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Submit anonymously
        </label>
      </div>

      {/* Name and Email (only if not anonymous) */}
      {!isAnonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your Name *
            </label>
            <input
              type="text"
              {...register('author')}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                ${errors.author 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              placeholder="Enter your name"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email (optional)
            </label>
            <input
              type="email"
              {...register('email')}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                ${errors.email 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Feature Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Feature Title *
        </label>
        <input
          type="text"
          {...register('title')}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            ${errors.title 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700'
            }
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
          placeholder="e.g., Dark mode toggle, Project search filter, Mobile gestures..."
        />
        <div className="flex justify-between items-center mt-2">
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {title?.length || 0}/100
          </p>
        </div>
      </div>

      {/* Feature Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Detailed Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none
            ${errors.description 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700'
            }
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
          placeholder="Describe your feature idea in detail. What should it do? How would it improve the user experience? Any specific implementation ideas?"
        />
        <div className="flex justify-between items-center mt-2">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {description?.length || 0}/500
          </p>
        </div>
      </div>

      {/* Examples Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">💡 Need inspiration?</h4>
        <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
          <p>• <strong>UI/UX:</strong> "Add a progress indicator for page loading"</p>
          <p>• <strong>Features:</strong> "Include a blog section for technical articles"</p>
          <p>• <strong>Interactivity:</strong> "Add keyboard shortcuts for navigation"</p>
          <p>• <strong>Performance:</strong> "Implement lazy loading for project images"</p>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all duration-200
          ${isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:ring-4 focus:ring-yellow-500/50'
          }
          text-white shadow-lg
        `}
        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        {isSubmitting ? 'Submitting Idea...' : 'Submit Feature Suggestion'}
      </motion.button>

      {/* Error Message */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
        </motion.div>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
        <p>
          🚀 <strong>Feature Suggestions:</strong> Great ideas are reviewed and may be implemented in future updates. 
          {!isAnonymous ? ' You\'ll be credited if your suggestion is implemented!' : ' Anonymous suggestions are welcome too!'}
        </p>
      </div>
    </form>
  );
};

export default SuggestionForm;
