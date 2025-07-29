import React from 'react';
import { Calendar, MapPin, Briefcase } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Data Analytics Intern',
      company: 'SmartBridge',
      period: 'May 2025 - Jul 2025',
      location: 'Remote',
      description: 'Mastered data visualization and dashboard creation with Tableau during a 2-month internship focused on Data Analytics.',
      achievements: [
        'Analyzed complex datasets to identify key trends and generate actionable business insights',
        'Designed and presented 5+ interactive Tableau dashboards to visualize key performance indicators',
        'Improved data accessibility through enhanced visualization techniques'
      ],
      technologies: ['Tableau', 'Data Analytics', 'Dashboard Creation', 'Data Visualization']
    },
    {
      title: 'AIML Trainee Intern',
      company: 'EduNet Foundation',
      period: 'May 2024 - Jun 2024',
      location: 'Remote',
      description: 'Completed intensive 6-week training in practical model development, data analysis, and ML principles.',
      achievements: [
        'Utilized the IBM SkillsBuild platform to apply algorithms on diverse datasets',
        'Applied learned techniques to a capstone project processing over 10,000 product reviews',
        'Achieved sentiment classification on large-scale dataset for real-world application'
      ],
      technologies: ['Python', 'IBM SkillsBuild', 'Machine Learning', 'Data Preprocessing', 'Model Evaluation']
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gray-50 w-full">
      <div className="container mx-auto px-6 w-full">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Professional Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A journey through internships and practical experiences, contributing to my growth as a data scientist and ML enthusiast.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-blue-600"></div>

            {experiences.map((experience, index) => (
              <div key={experience.company} className={`relative mb-12 ${index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:text-right'}`}>
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-gray-50"></div>

                <div className={`ml-16 md:ml-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{experience.title}</h3>
                        <h4 className="text-lg text-blue-600 mb-2">{experience.company}</h4>
                      </div>
                      <Briefcase size={24} className="text-blue-600 mt-1" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>{experience.period}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span>{experience.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">{experience.description}</p>

                    <div className="mb-6">
                      <h5 className="text-gray-900 font-medium mb-3">Key Achievements:</h5>
                      <ul className="space-y-2">
                        {experience.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-gray-600 text-sm flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-gray-900 font-medium mb-3">Technologies Used:</h5>
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map((tech) => (
                          <span key={tech} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a
              href="/MAREPALLI_SANTHOSH_RESUME99.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl text-lg font-medium transition-all duration-300"
            >
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;