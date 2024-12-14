import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePreferences } from '../../../contexts/PreferencesContext';

const SearchResult = ({ result, onSelect }) => {
    const getResultIcon = (type) => {
        const icons = {
            project: '🚀',
            blog: '📝',
            skill: '💡',
            contact: '👥',
            file: '📄',
            setting: '⚙️'
        };
        return icons[type] || '🔍';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => onSelect(result)}
        >
            <div className="flex items-center">
                <span className="text-2xl mr-3" role="img" aria-label={result.type}>
                    {getResultIcon(result.type)}
                </span>
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                        {result.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                        {result.description}
                    </p>
                </div>
                {result.shortcut && (
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                        {result.shortcut}
                    </kbd>
                )}
            </div>
        </motion.div>
    );
};

const SearchWidget = () => {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Sample search data
    const searchData = [
        {
            id: 1,
            type: 'project',
            title: 'E-commerce Platform',
            description: 'React and Node.js based e-commerce solution',
            shortcut: '⌘ P'
        },
        {
            id: 2,
            type: 'blog',
            title: 'Getting Started with AI',
            description: 'Introduction to AI development',
            shortcut: '⌘ B'
        },
        {
            id: 3,
            type: 'skill',
            title: 'React Development',
            description: 'Frontend development with React',
            shortcut: '⌘ S'
        }
    ];

    // Handle search
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        // Simulate search with delay
        const timer = setTimeout(() => {
            const filtered = searchData.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setSelectedIndex(0);
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < results.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : prev
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        handleSelect(results[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    const handleSelect = (result) => {
        // Add to recent searches
        setRecentSearches(prev => {
            const newSearches = [result, ...prev].slice(0, 5);
            return newSearches;
        });

        // Handle result selection
        console.log('Selected:', result);
        handleClose();
    };

    return (
        <div className="relative" ref={searchRef}>
            {/* Search Trigger */}
            <div
                onClick={handleOpen}
                className="flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
                <span className="text-gray-500 mr-3">🔍</span>
                <span className="text-gray-600">
                    {t('search.placeholder')}
                </span>
                <kbd className="hidden sm:inline-block ml-auto px-2 py-1 text-xs font-semibold text-gray-500 bg-white rounded">
                    ⌘ K
                </kbd>
            </div>

            {/* Search Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={handleClose}
                        />

                        {/* Search Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-0 left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50"
                            style={{ maxHeight: '80vh' }}
                        >
                            {/* Search Input */}
                            <div className="p-4 border-b">
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-3">🔍</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={t('search.inputPlaceholder')}
                                        className="flex-1 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Search Results */}
                            <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                                {results.length > 0 ? (
                                    <div className="p-2">
                                        {results.map((result, index) => (
                                            <SearchResult
                                                key={result.id}
                                                result={result}
                                                onSelect={handleSelect}
                                                isSelected={index === selectedIndex}
                                            />
                                        ))}
                                    </div>
                                ) : query ? (
                                    <div className="p-8 text-center">
                                        <span className="text-4xl">🤔</span>
                                        <p className="mt-4 text-gray-500">
                                            {t('search.noResults')}
                                        </p>
                                    </div>
                                ) : recentSearches.length > 0 ? (
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                                            {t('search.recentSearches')}
                                        </h3>
                                        {recentSearches.map(search => (
                                            <SearchResult
                                                key={search.id}
                                                result={search}
                                                onSelect={handleSelect}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* Search Tips */}
                            {preferences.showSearchTips && (
                                <div className="p-4 border-t bg-gray-50">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        {t('search.tips.title')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                        <div>⌘ + K: {t('search.tips.open')}</div>
                                        <div>↑ ↓: {t('search.tips.navigate')}</div>
                                        <div>Enter: {t('search.tips.select')}</div>
                                        <div>Esc: {t('search.tips.close')}</div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchWidget;
