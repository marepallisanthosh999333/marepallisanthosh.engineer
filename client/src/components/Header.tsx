import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';

const Header = () => {
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
      <nav className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900 flex-shrink-0">
            Marepalli Santhosh
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-gray-600 hover:text-blue-600 transition-all duration-300 relative group font-medium ${
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
            className="md:hidden text-gray-900 transition-all duration-300 p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-0 bg-white/98 backdrop-blur-md z-40 mobile-menu-overlay">
            <div className="flex flex-col pt-20">
              {navItems.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium py-4 border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;