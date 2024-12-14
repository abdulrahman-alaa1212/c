import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

const TimelineItem = ({ activity }) => {
    const getActivityIcon = (type) => {
        const icons = {
            project: '🚀',
            comment: '💬',
            update: '📝',
            achievement: '🏆',
            meeting: '👥',
            deadline: '⏰'
        };
        return icons[type] || '📌';
    };

    const getActivityColor = (type) => {
        const colors = {
            project: 'bg-blue-100 text-blue-800',
            comment: 'bg-green-100 text-green-800',
            update: 'bg-purple-100 text-purple-800',
            achievement: 'bg-yellow-100 text-yellow-800',
            meeting: 'bg-pink-100 text-pink-800',
            deadline: 'bg-red-100 text-red-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex group"
        >
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                <div className="w-px h-full bg-gray-200 group-last:hidden" />
            </div>

            {/* Activity Content */}
            <div className="flex-1 ml-4 mb-6">
                <div className="flex items-center">
                    <span className="text-xl mr-2" role="img" aria-label={activity.type}>
                        {getActivityIcon(activity.type)}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                    </h4>
                    <span className="ml-auto text-xs text-gray-500">
                        {activity.time}
                    </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    {activity.description}
                </p>
                
                {/* Additional Details */}
                {activity.details && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                        {activity.details}
                    </div>
                )}

                {/* Action Buttons */}
                {activity.actions && (
                    <div className="mt-2 flex space-x-2">
                        {activity.actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className="text-xs text-primary-600 hover:text-primary-700"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ActivityTimeline = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const [filter, setFilter] = useState('all');
    const [isExpanded, setIsExpanded] = useState(false);

    // Sample activities data
    const activities = [
        {
            id: 1,
            type: 'project',
            title: 'New Project Started',
            description: 'Started working on E-commerce Platform',
            time: '2 hours ago',
            details: 'Project scope and requirements defined',
            actions: [
                { label: 'View Project', onClick: () => {} },
                { label: 'Add Task', onClick: () => {} }
            ]
        },
        {
            id: 2,
            type: 'comment',
            title: 'New Comment',
            description: 'Client feedback received on Mobile App design',
            time: '4 hours ago'
        },
        {
            id: 3,
            type: 'achievement',
            title: 'Milestone Reached',
            description: '1000+ Portfolio Views',
            time: '1 day ago',
            details: '🎉 Congratulations! Keep up the great work!'
        },
        {
            id: 4,
            type: 'meeting',
            title: 'Client Meeting',
            description: 'Discussion about project requirements',
            time: '2 days ago',
            actions: [
                { label: 'View Notes', onClick: () => {} }
            ]
        }
    ];

    const filters = [
        { id: 'all', label: t('activity.filters.all') },
        { id: 'project', label: t('activity.filters.projects') },
        { id: 'comment', label: t('activity.filters.comments') },
        { id: 'achievement', label: t('activity.filters.achievements') }
    ];

    const filteredActivities = activities.filter(activity => {
        if (filter === 'all') return true;
        return activity.type === filter;
    });

    const displayedActivities = isExpanded 
        ? filteredActivities 
        : filteredActivities.slice(0, 3);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {t('activity.title')}
                </h2>
                <div className="flex space-x-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1 rounded-full text-xs ${
                                filter === f.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                <AnimatePresence>
                    {displayedActivities.map(activity => (
                        <TimelineItem key={activity.id} activity={activity} />
                    ))}
                </AnimatePresence>

                {/* Show More/Less Button */}
                {filteredActivities.length > 3 && (
                    <motion.button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isExpanded 
                            ? t('activity.showLess')
                            : t('activity.showMore', { count: filteredActivities.length - 3 })}
                    </motion.button>
                )}

                {/* Empty State */}
                {filteredActivities.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-4xl">📅</span>
                        <p className="mt-4 text-gray-500">
                            {t('activity.noActivities')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
