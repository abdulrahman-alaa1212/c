import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Projects = () => {
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'تطبيق المحفظة الشخصية',
      description: 'موقع شخصي تفاعلي مع لوحة تحكم ومميزات ذكاء اصطناعي',
      category: 'web',
      technologies: ['React', 'Node.js', 'TailwindCSS'],
      image: '/images/portfolio.jpg',
    },
    {
      id: 2,
      title: 'نظام إدارة المهام',
      description: 'تطبيق لإدارة المهام والمشاريع مع تتبع الوقت',
      category: 'mobile',
      technologies: ['React Native', 'Firebase'],
      image: '/images/task-manager.jpg',
    },
    // يمكنك إضافة المزيد من المشاريع هنا
  ];

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'web', label: 'تطبيقات الويب' },
    { id: 'mobile', label: 'تطبيقات الموبايل' },
    { id: 'desktop', label: 'تطبيقات سطح المكتب' },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">مشاريعي</h1>
      
      {/* فلتر المشاريع */}
      <div className="flex justify-center mb-8 space-x-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* عرض المشاريع */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="relative pb-[60%]">
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
