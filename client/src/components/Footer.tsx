import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 Marepalli Santhosh. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <span>Made with</span>
            <Heart size={16} className="text-red-500 fill-current" />
            <span>using React & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;