import React from 'react';
import { Code2, Palette, Rocket } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const About = () => {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [contentRef, contentVisible] = useScrollAnimation();
  const [cardsRef, cardsVisible] = useScrollAnimation();

  return (
    <section id="about" className="py-20 bg-white w-full">
      <div className="container mx-auto px-6 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div 
            ref={titleRef}
            className={`text-center mb-16 transform transition-all duration-1000 ease-out ${
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              About Me
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Data science and ML enthusiast with strong foundations in time series, NLP, and algorithmic trading. 
              Proficient in Python, TensorFlow; familiar with deploying models and dashboards.
            </p>
          </div>

          <div 
            ref={contentRef}
            className={`grid md:grid-cols-2 gap-12 items-center mb-16 transform transition-all duration-1000 ease-out w-full ${
              contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
            style={{ transitionDelay: contentVisible ? '200ms' : '0ms' }}
          >
            <div className="w-full">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">My Journey</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Currently pursuing B.Tech in AI/ML at Aditya College of Engineering and Technology, I've gained 
                practical experience through 2 internships and developed 3 end-to-end projects. My journey has 
                taken me from theoretical understanding to hands-on implementation of machine learning models, 
                focusing on real-world applications in sentiment analysis, stock prediction, and financial modeling.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                I believe that great data science is not just about clean algorithms, but about creating models 
                that solve real problems. Whether it's analyzing product reviews, predicting stock movements, or 
                building financial tools, I approach each project with curiosity, technical rigor, and attention to detail.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Problem Solver</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Detail Oriented</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">Quick Learner</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">Team Player</span>
              </div>
            </div>
            
            <div className="relative w-full flex justify-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Technical Excellence</h4>
                      <p className="text-gray-600 text-sm">Building robust, scalable solutions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Creative Problem Solving</h4>
                      <p className="text-gray-600 text-sm">Innovative approaches to complex challenges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Continuous Growth</h4>
                      <p className="text-gray-600 text-sm">Always learning and evolving</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div 
            ref={cardsRef}
            className={`grid md:grid-cols-3 gap-8 transform transition-all duration-1000 ease-out w-full ${
              cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
            style={{ transitionDelay: cardsVisible ? '400ms' : '0ms' }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl font-bold text-blue-600 mb-2">2+</div>
              <div className="text-gray-900 font-semibold mb-1">Internships</div>
              <div className="text-gray-600 text-sm">Hands-on industry experience</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl font-bold text-green-600 mb-2">3+</div>
              <div className="text-gray-900 font-semibold mb-1">Projects</div>
              <div className="text-gray-600 text-sm">End-to-end ML solutions</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl font-bold text-purple-600 mb-2">B.Tech</div>
              <div className="text-gray-900 font-semibold mb-1">AI/ML</div>
              <div className="text-gray-600 text-sm">Strong academic foundation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;