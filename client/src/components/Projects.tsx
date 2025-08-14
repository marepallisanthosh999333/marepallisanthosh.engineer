import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'Sentiment Analysis of Product Reviews',
      description: 'Engineered a sentiment analysis pipeline to classify customer reviews, employing NLTK for text preprocessing and TF-IDF for feature extraction. Achieved 88% accuracy on a dataset of 10,000+ reviews.',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['Python', 'NLTK', 'Scikit-learn', 'Matplotlib', 'TF-IDF'],
      liveUrl: 'https://github.com/marepallisanthosh999333/22MH1A4238/blob/main/SentimentAnalysisApssdcEdunet.ipynb',
      githubUrl: 'https://github.com/marepallisanthosh999333/22MH1A4238/blob/main/SentimentAnalysisApssdcEdunet.ipynb',
      featured: true
    },
    {
      title: 'Stock Price Movement Prediction',
      description: 'Developed a time-series forecasting model using an LSTM neural network with TensorFlow to predict the next day\'s closing price of NIFTY 50 stocks. Utilized 5 years of historical data for training and backtesting.',
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['Python', 'TensorFlow', 'LSTM', 'Pandas', 'Time Series'],
      liveUrl: 'https://github.com/marepallisanthosh999333/Stock-Price-Movement-Prediction',
      githubUrl: 'https://github.com/marepallisanthosh999333/Stock-Price-Movement-Prediction',
      featured: true
    },
    {
      title: 'Options Pricing Model (Black-Scholes)',
      description: 'Implemented the Black-Scholes-Merton model to calculate the theoretical price of European call and put options. Developed a tool to compute and visualize "the Greeks" for option risk analysis.',
      image: 'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['Python', 'NumPy', 'SciPy', 'Pandas', 'Financial Modeling'],
      liveUrl: 'https://github.com/marepallisanthosh999333',
      githubUrl: 'https://github.com/marepallisanthosh999333',
      featured: true
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <section id="projects" className="py-12 lg:py-20 bg-white section-mobile">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Featured Projects
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              A collection of my data science and machine learning projects showcasing practical applications in sentiment analysis, financial modeling, and predictive analytics.
            </p>
          </div>

          {/* Featured Projects */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16 card-grid-mobile">
            {featuredProjects.map((project, index) => (
              <div key={project.title} className="group bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-40 lg:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-4">
                      <a
                        href={project.liveUrl}
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors duration-200"
                        title="Live Demo"
                      >
                        <ExternalLink size={20} className="text-white" />
                      </a>
                      <a
                        href={project.githubUrl}
                        className="bg-gray-800 hover:bg-gray-900 p-3 rounded-full transition-colors duration-200"
                        title="Source Code"
                      >
                        <Github size={20} className="text-white" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Projects Section - Can be added later */}
          {otherProjects.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-center text-gray-900">Other Notable Projects</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 card-grid-mobile">
              {otherProjects.map((project, index) => (
                <div key={project.title} className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex space-x-2">
                        <a
                          href={project.liveUrl}
                          className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors duration-200"
                          title="Live Demo"
                        >
                          <ExternalLink size={16} className="text-white" />
                        </a>
                        <a
                          href={project.githubUrl}
                          className="bg-gray-800 hover:bg-gray-900 p-2 rounded-full transition-colors duration-200"
                          title="Source Code"
                        >
                          <Github size={16} className="text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">{project.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-0.5">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="https://github.com/marepallisanthosh999333"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-3xl transition-all duration-300 font-medium"
            >
              <Github size={20} />
              <span>View All Projects on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
