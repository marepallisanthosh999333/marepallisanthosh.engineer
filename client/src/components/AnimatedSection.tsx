import React, { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-16 opacity-0'
      } ${className}`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms' 
      }}
    >
      {children}
    </section>
  );
};

export default AnimatedSection;