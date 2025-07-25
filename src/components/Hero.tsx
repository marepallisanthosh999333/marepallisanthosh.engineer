import React from 'react';
import { Linkedin, Github } from 'lucide-react';
import LeetCodeIcon from './LeetCodeIcon';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="space-y-8 animate-fadeInUp">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-fadeInUp">
                Hi,
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight animate-fadeInUp delay-200">
                I'am <span className="text-blue-600">Marepalli Santhosh</span>
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight animate-fadeInUp delay-300">
                Financial Analyst
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp delay-400">
              <a
                href="#contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 text-center transform hover:scale-105"
              >
                Contact
              </a>
              <a
                href="/MAREPALLI_SANTHOSH_RESUME (2).pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 text-center transform hover:scale-105"
              >
                Download Resume
              </a>
            </div>

            <div className="flex items-center space-x-6 pt-4 animate-fadeInUp delay-500">
              <a
                href="https://www.linkedin.com/in/marepalli-santhosh-42b16a284/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300 transform hover:scale-110"
              >
                <Linkedin size={24} fill="currentColor" />
              </a>
              <a
                href="https://leetcode.com/u/marepallisanthosh999333/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300 transform hover:scale-110"
              >
                <LeetCodeIcon size={24} />
              </a>
              <a
                href="https://github.com/marepallisanthosh999333"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-all duration-300 transform hover:scale-110"
              >
                <Github size={24} fill="currentColor" />
              </a>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="flex justify-center lg:justify-end animate-fadeInUp delay-300">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-blue-600 relative overflow-hidden transform transition-all duration-500 hover:scale-105">
                <img
                  src="/me.png"
                  alt="Marepalli Santhosh"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/4 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;