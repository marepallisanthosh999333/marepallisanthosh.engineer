import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include user authentication, product management, shopping cart, and payment processing.',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      title: 'Task Management App',
      description: 'A collaborative project management tool with real-time updates, drag-and-drop functionality, and team collaboration features.',
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['Vue.js', 'Socket.io', 'MongoDB', 'Express'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      title: 'Weather Dashboard',
      description: 'A responsive weather application with location-based forecasts, interactive maps, and historical weather data visualization.',
      image: 'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['React', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      title: 'Social Media Analytics',
      description: 'A comprehensive analytics dashboard for social media metrics with data visualization and automated reporting features.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['Next.js', 'Python', 'PostgreSQL', 'D3.js'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      title: 'Crypto Portfolio Tracker',
      description: 'Real-time cryptocurrency portfolio tracking with price alerts, historical analysis, and market news integration.',
      image: 'https://images.pexels.com/photos/3183181/pexels-photo-3183181.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['React', 'Node.js', 'WebSockets', 'CoinGecko API'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      title: 'Learning Management System',
      description: 'A comprehensive LMS with course creation, student progress tracking, video streaming, and interactive assessments.',
      image: 'https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=500',
      tags: ['React', 'Express', 'MongoDB', 'AWS S3'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A collection of my recent work showcasing different technologies and problem-solving approaches.
            </p>
          </div>

          {/* Featured Projects */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <div key={project.title} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
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

          {/* Other Projects */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-center text-gray-900">Other Notable Projects</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((project, index) => (
                <div key={project.title} className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg">
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
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">{project.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
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

          <div className="text-center mt-12">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium"
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