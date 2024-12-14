import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PreferencesContext = createContext();

const defaultPreferences = {
    theme: {
        mode: 'light',
        color: 'blue',
        fontSize: 'medium',
        reducedMotion: false,
        contrast: 'normal'
    },
    layout: {
        density: 'comfortable',
        sidebarPosition: 'right',
        cardStyle: 'modern'
    },
    notifications: {
        sound: true,
        desktop: true,
        email: true
    },
    accessibility: {
        screenReader: false,
        keyboardNavigation: true,
        textToSpeech: false
    },
    ai: {
        chatbotEnabled: true,
        autoSuggestions: true,
        voiceCommands: false
    },
    dashboard: {
        defaultView: 'grid',
        visibleWidgets: ['stats', 'projects', 'tasks', 'calendar'],
        chartStyle: 'minimal'
    }
};

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useLocalStorage('userPreferences', defaultPreferences);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Apply preferences to document
        document.documentElement.setAttribute('data-theme', preferences.theme.mode);
        document.documentElement.style.fontSize = getFontSizeValue(preferences.theme.fontSize);
        
        if (preferences.theme.reducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }
        
        setIsLoading(false);
    }, [preferences]);

    const getFontSizeValue = (size) => {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'x-large': '20px'
        };
        return sizes[size] || '16px';
    };

    const updatePreferences = (category, updates) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                ...updates
            }
        }));
    };

    const resetPreferences = (category = null) => {
        if (category) {
            setPreferences(prev => ({
                ...prev,
                [category]: defaultPreferences[category]
            }));
        } else {
            setPreferences(defaultPreferences);
        }
    };

    const toggleFeature = (category, feature) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [feature]: !prev[category][feature]
            }
        }));
    };

    const value = {
        preferences,
        updatePreferences,
        resetPreferences,
        toggleFeature,
        isLoading
    };

    return (
        <PreferencesContext.Provider value={value}>
            {!isLoading && children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
