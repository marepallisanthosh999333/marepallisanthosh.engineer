import React, { useState, useEffect } from 'react';
import { Menu, X, User, Star, Github, Network } from 'lucide-react';

interface GitHubButtonProps {
  username: string;
  repo: string;
  className?: string;
}

interface ProjectStructureButtonProps {
  onClick: () => void;
  className?: string;
}

const GitHubButton = ({ username, repo, className = "" }: GitHubButtonProps) => {
  return (
    <a
      href={`https://github.com/${username}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      <Github size={16} />
      <span>GitHub</span>
    </a>
  );
};

const StarButton = ({ username, repo, className = "" }: GitHubButtonProps) => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        const data = await response.json();
        setStars(data.stargazers_count || 0);
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
        setStars(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, [username, repo]);

  return (
    <a
      href={`https://github.com/${username}/${repo}/stargazers`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      <Star size={14} fill="currentColor" />
      <span>{loading ? '...' : stars}</span>
    </a>
  );
};

const ProjectStructureButton = ({ onClick, className = "" }: ProjectStructureButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${className}`}
      title="Explore interactive project structure"
    >
      <Network size={14} />
      <span>Structure</span>
    </button>
  );
};

interface HeaderProps {
  onProjectStructureClick: () => void;
}

const Header = ({ onProjectStructureClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Work', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transform translate-y-0' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold text-gray-900">
              Marepalli Santhosh
            </div>
            {/* Separate GitHub and Star Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <GitHubButton 
                username="marepallisanthosh999333" 
                repo="marepallisanthosh.engineer"
              />
              <StarButton 
                username="marepallisanthosh999333" 
                repo="marepallisanthosh.engineer"
              />
              <ProjectStructureButton 
                onClick={onProjectStructureClick}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-gray-600 hover:text-blue-600 transition-all duration-300 relative group font-medium transform hover:scale-105 ${
                  index === 0 ? 'text-blue-600' : ''
                }`}
              >
                {item.label}
                {index === 0 && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900 transform transition-all duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeInUp">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium transform hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.label}
                </a>
              ))}
              {/* Mobile GitHub and Star Buttons */}
              <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                <GitHubButton 
                  username="marepallisanthosh999333" 
                  repo="marepallisanthosh.engineer"
                />
                <StarButton 
                  username="marepallisanthosh999333" 
                  repo="marepallisanthosh.engineer"
                />
                <ProjectStructureButton 
                  onClick={() => {
                    onProjectStructureClick();
                    setIsMenuOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;