import React from 'react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Programming Languages',
      skills: [
        { name: 'Python', level: 90 },
        { name: 'SQL', level: 85 },
        { name: 'Java', level: 75 },
        { name: 'C++', level: 70 },
        { name: 'Shell', level: 65 },
      ]
    },
    {
      title: 'Data Science & ML',
      skills: [
        { name: 'Scikit-learn', level: 88 },
        { name: 'TensorFlow', level: 85 },
        { name: 'Pandas', level: 92 },
        { name: 'NumPy', level: 90 },
        { name: 'NLTK', level: 85 },
      ]
    },
    {
      title: 'Visualization & Tools',
      skills: [
        { name: 'Tableau', level: 88 },
        { name: 'Matplotlib', level: 85 },
        { name: 'Seaborn', level: 82 },
        { name: 'Git', level: 80 },
        { name: 'Jupyter', level: 90 },
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 bg-gray-50 w-full">
      <div className="container mx-auto px-6 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Skills & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive toolkit for data science, machine learning, and analytics from data preprocessing to model deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <div key={category.title} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold mb-6 text-center text-blue-600">
                  {category.title}
                </h3>
                <div className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900 font-medium">{skill.name}</span>
                        <span className="text-gray-500 text-sm">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold mb-8 text-gray-900">Currently Learning</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['Deep Learning', 'Computer Vision', 'Big Data', 'Cloud Computing', 'Docker'].map((tech) => (
                <span 
                  key={tech}
                  className="bg-orange-100 border border-orange-200 text-orange-700 px-4 py-2 rounded-2xl font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;