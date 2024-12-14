import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import StatCard from './components/StatCard';
import ProjectsWidget from './components/ProjectsWidget';
import AnalyticsChart from './components/AnalyticsChart';
import ActivityTimeline from './components/ActivityTimeline';
import QuickActions from './components/QuickActions';
import NotificationsWidget from './components/NotificationsWidget';
import SearchWidget from './components/SearchWidget';
import { ChatBot } from '../../components/AIChat/ChatBot';

const Dashboard = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const { layout, theme } = preferences;

    // Sample stats data
    const stats = [
        {
            title: t('dashboard.stats.views'),
            value: '12.5K',
            change: 12,
            icon: '👁️'
        },
        {
            title: t('dashboard.stats.projects'),
            value: '25',
            change: 8,
            icon: '🚀'
        },
        {
            title: t('dashboard.stats.skills'),
            value: '15',
            change: 5,
            icon: '💡'
        },
        {
            title: t('dashboard.stats.rating'),
            value: '4.9',
            change: 2,
            icon: '⭐'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Search */}
            <div className="mb-6">
                <SearchWidget />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        {...stat}
                        layout={layout.statsLayout}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Chart */}
                    <AnalyticsChart />

                    {/* Projects Widget */}
                    <ProjectsWidget layout={layout.projectsLayout} />

                    {/* Activity Timeline */}
                    <ActivityTimeline />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <QuickActions />

                    {/* Notifications */}
                    <NotificationsWidget />

                    {/* AI Chat Assistant */}
                    {preferences.showAIAssistant && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-sm"
                        >
                            <ChatBot
                                theme={theme}
                                preferences={preferences}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
