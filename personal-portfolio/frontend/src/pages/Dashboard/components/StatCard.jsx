import React from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../../contexts/PreferencesContext';

const StatCard = ({ title, value, change, icon, layout = 'grid' }) => {
    const { preferences } = usePreferences();
    const { theme, dashboard } = preferences;

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const variants = {
        grid: {
            card: "bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow",
            content: "space-y-4",
            header: "flex justify-between items-start",
            iconWrapper: "text-4xl",
            valueWrapper: "mt-2",
            value: "text-3xl font-bold text-gray-900",
            change: "flex items-center space-x-1 mt-1",
            title: "text-gray-500 text-sm"
        },
        list: {
            card: "bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow",
            content: "flex items-center space-x-4 flex-1",
            header: "flex items-center space-x-4",
            iconWrapper: "text-2xl",
            valueWrapper: "flex items-baseline space-x-4",
            value: "text-2xl font-bold text-gray-900",
            change: "flex items-center space-x-1",
            title: "text-gray-500 text-sm"
        }
    };

    const styles = variants[layout];

    return (
        <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.iconWrapper} role="img" aria-label={title}>
                        {icon}
                    </span>
                    {layout === 'list' && (
                        <div>
                            <h3 className={styles.title}>{title}</h3>
                        </div>
                    )}
                </div>

                <div className={styles.valueWrapper}>
                    <span className={styles.value}>{value}</span>
                    <div className={styles.change}>
                        <span className={getChangeColor(change)}>
                            {change > 0 ? '↑' : change < 0 ? '↓' : '–'}
                            {Math.abs(change)}%
                        </span>
                    </div>
                </div>

                {layout === 'grid' && (
                    <h3 className={styles.title}>{title}</h3>
                )}
            </div>

            {/* Tooltip */}
            {dashboard.showTooltips && (
                <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-2 rounded text-sm -top-10 left-1/2 transform -translate-x-1/2">
                    {title}: {value}
                </div>
            )}

            {/* Mini Chart (if enabled) */}
            {dashboard.showMiniCharts && (
                <div className="h-10 mt-4">
                    {/* Add your mini chart component here */}
                </div>
            )}
        </motion.div>
    );
};

export default StatCard;
