import React from 'react';
import { Linkedin, Github } from 'lucide-react';
import LeetCodeIcon from './LeetCodeIcon';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-white overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto hero-grid">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 animate-fadeInUp text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fadeInUp hero-title-main">
                Hi,
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-fadeInUp delay-200 hero-title-main">
                I'am <span className="text-blue-600">Marepalli Santhosh</span>
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight animate-fadeInUp delay-300 hero-title-secondary">
                Data Scientist
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp delay-400 hero-buttons justify-center lg:justify-start">
              <a
                href="#contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-3xl font-medium transition-all duration-300 text-center"
              >
                Contact
              </a>
              <a
                href="/MAREPALLI_SANTHOSH_RESUME99.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-3xl font-medium transition-all duration-300 text-center"
              >
                Download Resume
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4 animate-fadeInUp delay-500">
              <a
                href="https://www.linkedin.com/in/marepalli-santhosh-42b16a284/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300"
              >
                <Linkedin size={24} fill="currentColor" />
              </a>
              <a
                href="https://leetcode.com/u/marepallisanthosh999333/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300"
              >
                <LeetCodeIcon size={24} />
              </a>
              <a
                href="https://github.com/marepallisanthosh999333"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300"
              >
                <Github size={24} fill="currentColor" />
              </a>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="flex justify-center animate-fadeInUp delay-300 order-first lg:order-last">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-blue-600 relative overflow-hidden transition-all duration-500 profile-image-mobile mx-auto">
                <img
                  src="/me.png"
                  alt="Marepalli Santhosh"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-6 h-6 lg:w-8 lg:h-8 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 w-4 h-4 lg:w-6 lg:h-6 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/4 -left-4 lg:-left-8 w-3 h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;