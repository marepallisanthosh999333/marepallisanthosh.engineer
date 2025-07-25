import React from 'react';
import { Code2, Palette, Rocket } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const About = () => {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [contentRef, contentVisible] = useScrollAnimation();
  const [cardsRef, cardsVisible] = useScrollAnimation();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
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
            className={`grid md:grid-cols-2 gap-12 items-center mb-16 transform transition-all duration-1000 ease-out ${
              contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
            style={{ transitionDelay: contentVisible ? '200ms' : '0ms' }}
          >
            <div>
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
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Problem Solver</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Team Player</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Lifelong Learner</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/me.png"
                  alt="Profile"
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Marepalli Santhosh</h4>
                  <p className="text-gray-600">AI/ML Student & Data Science Enthusiast</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            ref={cardsRef}
            className={`grid md:grid-cols-3 gap-8 transform transition-all duration-1000 ease-out ${
              cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
            style={{ transitionDelay: cardsVisible ? '400ms' : '0ms' }}
          >
            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Code2 size={48} className="mx-auto mb-4 text-blue-600 animate-float" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Machine Learning</h3>
                <p className="text-gray-600">
                  Building intelligent models for sentiment analysis, time series forecasting, and predictive analytics.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Palette size={48} className="mx-auto mb-4 text-blue-600 animate-float" style={{ animationDelay: '1s' }} />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Data Visualization</h3>
                <p className="text-gray-600">
                  Creating interactive dashboards and visualizations with Tableau, Matplotlib, and Seaborn.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Rocket size={48} className="mx-auto mb-4 text-blue-600 animate-float" style={{ animationDelay: '2s' }} />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Model Optimization</h3>
                <p className="text-gray-600">
                  Optimizing ML models for accuracy, efficiency, and real-world deployment readiness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;