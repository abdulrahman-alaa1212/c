import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

const ActionButton = ({ action, onAction }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.button
            className={`relative flex items-center p-4 rounded-lg ${
                action.variant === 'primary'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
            } hover:shadow-md transition-shadow`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onAction(action)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="text-2xl mr-3" role="img" aria-label={action.name}>
                {action.icon}
            </span>
            <div className="flex-1 text-left">
                <h3 className="font-medium">{action.name}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
            </div>
            
            {/* Hover Tooltip */}
            <AnimatePresence>
                {isHovered && action.tooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                    >
                        {action.tooltip}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

const QuickActions = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const [recentActions, setRecentActions] = useState([]);

    // Sample quick actions
    const actions = [
        {
            id: 'new-project',
            name: t('quickActions.newProject'),
            description: t('quickActions.newProjectDesc'),
            icon: '🚀',
            variant: 'primary',
            tooltip: t('quickActions.newProjectTooltip'),
            handler: () => {
                // Handle new project creation
            }
        },
        {
            id: 'add-blog',
            name: t('quickActions.addBlog'),
            description: t('quickActions.addBlogDesc'),
            icon: '✍️',
            tooltip: t('quickActions.addBlogTooltip'),
            handler: () => {
                // Handle blog post creation
            }
        },
        {
            id: 'update-skills',
            name: t('quickActions.updateSkills'),
            description: t('quickActions.updateSkillsDesc'),
            icon: '🎯',
            tooltip: t('quickActions.updateSkillsTooltip'),
            handler: () => {
                // Handle skills update
            }
        },
        {
            id: 'share-portfolio',
            name: t('quickActions.sharePortfolio'),
            description: t('quickActions.sharePortfolioDesc'),
            icon: '🔗',
            tooltip: t('quickActions.sharePortfolioTooltip'),
            handler: () => {
                // Handle portfolio sharing
            }
        }
    ];

    const handleAction = (action) => {
        // Execute action handler
        action.handler();

        // Add to recent actions
        setRecentActions(prev => {
            const newActions = [
                {
                    ...action,
                    timestamp: new Date().toISOString()
                },
                ...prev
            ].slice(0, 5); // Keep only last 5 actions
            return newActions;
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {t('quickActions.title')}
                </h2>
                
                {/* Recent Actions Dropdown */}
                {recentActions.length > 0 && (
                    <div className="relative group">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                            {t('quickActions.recentActions')}
                        </button>
                        
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg invisible group-hover:visible">
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    {t('quickActions.recentActionsTitle')}
                                </h3>
                                {recentActions.map((action, index) => (
                                    <div
                                        key={`${action.id}-${index}`}
                                        className="flex items-center py-2"
                                    >
                                        <span className="text-lg mr-2">
                                            {action.icon}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">
                                                {action.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(action.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map(action => (
                    <ActionButton
                        key={action.id}
                        action={action}
                        onAction={handleAction}
                    />
                ))}
            </div>

            {/* AI Assistant Suggestion */}
            {preferences.showAIAssistant && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">🤖</span>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">
                                {t('quickActions.aiSuggestion.title')}
                            </h3>
                            <p className="text-sm text-blue-700 mt-1">
                                {t('quickActions.aiSuggestion.message')}
                            </p>
                            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                                {t('quickActions.aiSuggestion.action')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default QuickActions;
