import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const FloatingFeedbackButton: React.FC = () => {
  const scrollToFeedback = () => {
    const feedbackSection = document.getElementById('feedback');
    if (feedbackSection) {
      feedbackSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <motion.button
      onClick={scrollToFeedback}
      className="fixed left-0 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-2 py-6 rounded-r-lg shadow-lg z-50 transition-all duration-300 group"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ x: -10 }}
      animate={{ x: 0 }}
      title="Go to Feedback Section"
      style={{ writingMode: 'vertical-rl' }}
    >
      <span className="text-xs font-medium">
        Feedback
      </span>
    </motion.button>
  );
};

export default FloatingFeedbackButton;
