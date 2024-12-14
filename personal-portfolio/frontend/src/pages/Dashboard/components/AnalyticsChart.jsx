import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

// Register ChartJS components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsChart = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const [timeRange, setTimeRange] = useState('week');
    const [chartType, setChartType] = useState('line');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);

    const timeRanges = [
        { id: 'day', label: t('analytics.timeRanges.day') },
        { id: 'week', label: t('analytics.timeRanges.week') },
        { id: 'month', label: t('analytics.timeRanges.month') },
        { id: 'year', label: t('analytics.timeRanges.year') }
    ];

    const metrics = [
        { id: 'views', label: t('analytics.metrics.views'), color: '#3B82F6' },
        { id: 'engagement', label: t('analytics.metrics.engagement'), color: '#10B981' },
        { id: 'conversions', label: t('analytics.metrics.conversions'), color: '#6366F1' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Sample data
                const labels = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return date.toLocaleDateString();
                });

                setData({
                    labels,
                    datasets: metrics.map(metric => ({
                        label: metric.label,
                        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
                        borderColor: metric.color,
                        backgroundColor: `${metric.color}20`,
                        fill: true,
                        tension: 0.4
                    }))
                });
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        animation: {
            duration: 1000
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">
                    {t('analytics.title')}
                </h2>

                <div className="flex space-x-4">
                    {/* Chart Type Toggle */}
                    <div className="flex rounded-lg overflow-hidden border">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 text-sm ${
                                chartType === 'line'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {t('analytics.chartTypes.line')}
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-4 py-2 text-sm ${
                                chartType === 'bar'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {t('analytics.chartTypes.bar')}
                        </button>
                    </div>

                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {timeRanges.map(range => (
                            <option key={range.id} value={range.id}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                rotate: 360
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"
                        />
                    </div>
                ) : data ? (
                    chartType === 'line' ? (
                        <Line data={data} options={chartOptions} />
                    ) : (
                        <Bar data={data} options={chartOptions} />
                    )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500">
                            {t('analytics.noData')}
                        </p>
                    </div>
                )}
            </div>

            {/* Metrics Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                {metrics.map(metric => (
                    <div
                        key={metric.id}
                        className="text-center p-4 rounded-lg bg-gray-50"
                    >
                        <h3 className="text-sm text-gray-500">
                            {metric.label}
                        </h3>
                        <p className="text-2xl font-bold mt-2" style={{ color: metric.color }}>
                            {Math.floor(Math.random() * 1000)}
                        </p>
                        <span className="text-xs text-green-500">
                            +{Math.floor(Math.random() * 20)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsChart;
