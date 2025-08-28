import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const FloatingFeedbackButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToFeedback = () => {
    const feedbackSection = document.getElementById('feedback');
    if (feedbackSection) {
      feedbackSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleScroll = () => {
    const aboutSection = document.getElementById('about');
    const footerSection = document.getElementById('footer');

    if (aboutSection && footerSection) {
      const aboutSectionRect = aboutSection.getBoundingClientRect();
      const footerSectionRect = footerSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const shouldBeVisible = aboutSectionRect.top < windowHeight / 2;

      setIsVisible(shouldBeVisible);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="feedback-button"
          onClick={scrollToFeedback}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          title="Go to Feedback Section"
        >
          <MessageSquare size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingFeedbackButton;
