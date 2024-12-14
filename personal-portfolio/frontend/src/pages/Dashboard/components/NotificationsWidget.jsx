import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

const NotificationItem = ({ notification, onAction, onDismiss }) => {
    const getNotificationIcon = (type) => {
        const icons = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            message: '💬',
            update: '🔄'
        };
        return icons[type] || 'ℹ️';
    };

    const getNotificationColor = (type) => {
        const colors = {
            info: 'bg-blue-50 border-blue-200',
            success: 'bg-green-50 border-green-200',
            warning: 'bg-yellow-50 border-yellow-200',
            error: 'bg-red-50 border-red-200',
            message: 'bg-purple-50 border-purple-200',
            update: 'bg-gray-50 border-gray-200'
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`relative p-4 rounded-lg border ${getNotificationColor(notification.type)} mb-3`}
        >
            <div className="flex items-start">
                <span className="text-2xl mr-3" role="img" aria-label={notification.type}>
                    {getNotificationIcon(notification.type)}
                </span>
                
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                    </p>
                    
                    {/* Action Buttons */}
                    {notification.actions && (
                        <div className="flex space-x-3 mt-3">
                            {notification.actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => onAction(notification, action)}
                                    className={`text-sm ${
                                        action.primary
                                            ? 'text-primary-600 hover:text-primary-700'
                                            : 'text-gray-600 hover:text-gray-700'
                                    }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <span className="block text-xs text-gray-500 mt-2">
                        {notification.time}
                    </span>
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={() => onDismiss(notification)}
                    className="ml-3 text-gray-400 hover:text-gray-500"
                >
                    ×
                </button>
            </div>
        </motion.div>
    );
};

const NotificationsWidget = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isExpanded, setIsExpanded] = useState(false);

    // Sample notifications data
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                type: 'success',
                title: 'Project Completed',
                message: 'Mobile App Development project has been marked as completed.',
                time: '2 minutes ago',
                actions: [
                    { label: 'View Project', primary: true },
                    { label: 'Share' }
                ]
            },
            {
                id: 2,
                type: 'info',
                title: 'New Message',
                message: 'You have received a new message from Client A.',
                time: '1 hour ago',
                actions: [
                    { label: 'Read Message', primary: true }
                ]
            },
            {
                id: 3,
                type: 'warning',
                title: 'Deadline Approaching',
                message: 'Project X deadline is in 2 days.',
                time: '3 hours ago',
                actions: [
                    { label: 'View Timeline', primary: true },
                    { label: 'Request Extension' }
                ]
            }
        ]);
    }, []);

    const filters = [
        { id: 'all', label: t('notifications.filters.all') },
        { id: 'unread', label: t('notifications.filters.unread') },
        { id: 'important', label: t('notifications.filters.important') }
    ];

    const handleAction = (notification, action) => {
        // Handle notification action
        console.log('Notification action:', { notification, action });
    };

    const handleDismiss = (notification) => {
        setNotifications(prev => 
            prev.filter(n => n.id !== notification.id)
        );
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'important') return notification.important;
        return true;
    });

    const displayedNotifications = isExpanded 
        ? filteredNotifications 
        : filteredNotifications.slice(0, 3);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {t('notifications.title')}
                    </h2>
                    {notifications.length > 0 && (
                        <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            {notifications.length}
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {/* Filters */}
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

                    {/* Clear All Button */}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            {t('notifications.clearAll')}
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {displayedNotifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onAction={handleAction}
                            onDismiss={handleDismiss}
                        />
                    ))}
                </AnimatePresence>

                {/* Show More/Less Button */}
                {filteredNotifications.length > 3 && (
                    <motion.button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isExpanded 
                            ? t('notifications.showLess')
                            : t('notifications.showMore', { count: filteredNotifications.length - 3 })}
                    </motion.button>
                )}

                {/* Empty State */}
                {filteredNotifications.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-4xl">🔔</span>
                        <p className="mt-4 text-gray-500">
                            {t('notifications.noNotifications')}
                        </p>
                    </div>
                )}
            </div>

            {/* Notification Settings */}
            {preferences.showNotificationSettings && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                        {t('notifications.settings.title')}
                    </h3>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-primary-600"
                                checked={preferences.notifications?.email}
                                onChange={() => {}}
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                {t('notifications.settings.email')}
                            </span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-primary-600"
                                checked={preferences.notifications?.push}
                                onChange={() => {}}
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                {t('notifications.settings.push')}
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsWidget;
