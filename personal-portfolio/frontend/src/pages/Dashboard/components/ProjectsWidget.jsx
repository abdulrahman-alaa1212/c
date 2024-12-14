import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

const ProjectCard = ({ project, onSelect }) => {
    const { preferences } = usePreferences();
    
    return (
        <motion.div
            layout
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(project)}
        >
            <div className="flex items-center space-x-4">
                {/* Project Icon/Image */}
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl" role="img" aria-label={project.type}>
                        {project.icon}
                    </span>
                </div>

                {/* Project Info */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                </div>

                {/* Project Status */}
                <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {project.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                        {project.dueDate}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            {project.progress !== undefined && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-primary-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-500">{project.progress}%</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const ProjectsWidget = ({ layout = 'grid' }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Sample projects data
    const projects = [
        {
            id: 1,
            name: 'E-commerce Platform',
            description: 'Modern e-commerce solution with AI',
            status: 'in-progress',
            progress: 75,
            dueDate: '2024-12-31',
            icon: '🛍️',
            type: 'web'
        },
        {
            id: 2,
            name: 'Mobile App',
            description: 'Cross-platform mobile application',
            status: 'completed',
            progress: 100,
            dueDate: '2024-11-30',
            icon: '📱',
            type: 'mobile'
        },
        // Add more projects...
    ];

    const filters = [
        { id: 'all', label: t('projects.filters.all') },
        { id: 'in-progress', label: t('projects.filters.inProgress') },
        { id: 'completed', label: t('projects.filters.completed') }
    ];

    const filteredProjects = projects
        .filter(project => {
            if (filter === 'all') return true;
            return project.status === filter;
        })
        .filter(project => {
            if (!searchQuery) return true;
            return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   project.description.toLowerCase().includes(searchQuery.toLowerCase());
        });

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {t('projects.title')}
                </h2>
                <button className="btn-primary">
                    {t('projects.addNew')}
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex space-x-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-full text-sm ${
                                filter === f.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('projects.searchPlaceholder')}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Projects List */}
            <div className={`space-y-4 ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                <AnimatePresence>
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onSelect={setSelectedProject}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                    <span className="text-4xl">🔍</span>
                    <p className="mt-4 text-gray-500">
                        {t('projects.noResults')}
                    </p>
                </div>
            )}

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Project Details Content */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">
                                    {selectedProject.name}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedProject.description}
                                </p>
                                {/* Add more project details... */}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsWidget;
