import React from 'react';
import { Heart, Github, Linkedin } from 'lucide-react';
import LeetCodeIcon from './LeetCodeIcon';

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center">
          {/* Main Title */}
          <h2 className="text-4xl font-bold mb-6">Marepalli Santhosh</h2>
          
          {/* Description */}
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            AI/ML Enthusiast and Finance Technology Specialist passionate about developing intelligent solutions. 
            Exploring the intersection of artificial intelligence, machine learning, and financial innovation. 
            Dedicated to building data-driven applications that transform the future of finance and technology.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-4 mb-12">
            <a 
              href="https://github.com/marepallisanthosh999333"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://leetcode.com/u/marepallisanthosh999333/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300"
              aria-label="LeetCode"
            >
              <LeetCodeIcon size={20} />
            </a>
            <a 
              href="https://www.hackerrank.com/profile/marepallisantho1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              aria-label="HackerRank"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c1.285 0 9.75 4.886 10.392 6 .642 1.114.642 10.886 0 12C21.75 19.114 13.285 24 12 24s-9.75-4.886-10.392-6c-.642-1.114-.642-10.886 0-12C2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.258v3.875H9.963V7.057c0-.143-.116-.258-.258-.258-.142 0-.258.115-.258.258v9.886c0 .141.116.258.258.258.142 0 .258-.117.258-.258v-4.13h4.074v4.13c0 .141.116.258.258.258.141 0 .258-.117.258-.258V7.057c0-.143-.117-.258-.258-.258z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/marepalli-santhosh-42b16a284/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              Copyright ©2025{' '}
              <a 
                href="https://www.marepallisanthosh.engineer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                Marepalli Santhosh
              </a>
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Marepalli Santhosh ™</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;