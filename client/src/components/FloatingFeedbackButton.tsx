import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface FloatingFeedbackButtonProps {
  aboutSectionRef: React.RefObject<HTMLElement>;
}

const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({ aboutSectionRef }) => {
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
    const aboutSection = aboutSectionRef.current;
    const footerSection = document.getElementById('footer');

    if (aboutSection && footerSection) {
      const aboutSectionTop = aboutSection.offsetTop;
      const footerSectionTop = footerSection.offsetTop;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show the button if the user has scrolled past the top of the "About" section
      // and the top of the footer is not yet visible.
      if (scrollY > aboutSectionTop - windowHeight / 2 && scrollY + windowHeight < footerSectionTop) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [aboutSectionRef]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
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
