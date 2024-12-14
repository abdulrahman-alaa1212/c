import React, { createContext, useState, useContext, useEffect } from 'react';
import { CONFIG } from '../config/app.config';
import { useAITranslation } from '../hooks/useAITranslation';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // State
    const [currentLocale, setCurrentLocale] = useLocalStorage('userLocale', CONFIG.DEFAULTS.LANGUAGE);
    const [currentDialect, setCurrentDialect] = useState(CONFIG.LANGUAGES[CONFIG.DEFAULTS.LANGUAGE].dialect);
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Custom hooks
    const { translate } = useAITranslation();
    const { country } = useGeolocation();

    // Detect user's preferred locale and dialect
    useEffect(() => {
        const detectUserPreferences = async () => {
            try {
                // Try to detect from browser settings
                const browserLang = navigator.language.replace('-', '_');
                
                // If geolocation is available, use country to determine dialect
                if (country) {
                    switch (country) {
                        case 'EG':
                            setCurrentDialect('egyptian');
                            break;
                        case 'SA':
                        case 'AE':
                        case 'KW':
                        case 'BH':
                        case 'QA':
                        case 'OM':
                            setCurrentDialect('gulf');
                            break;
                        // Add more dialect mappings as needed
                    }
                }

                // Set locale if supported, otherwise use default
                if (CONFIG.LANGUAGES[browserLang]) {
                    setCurrentLocale(browserLang);
                }
            } catch (error) {
                console.error('Error detecting user preferences:', error);
            }
        };

        detectUserPreferences();
    }, [country]);

    // Load translations
    useEffect(() => {
        const loadTranslations = async () => {
            setIsLoading(true);
            try {
                // First try to load from cache
                const cachedTranslations = localStorage.getItem(`translations_${currentLocale}`);
                if (cachedTranslations) {
                    setTranslations(JSON.parse(cachedTranslations));
                    setIsLoading(false);
                    return;
                }

                // If not in cache, load from static files or API
                const response = await fetch(`/locales/${currentLocale}.json`);
                const data = await response.json();
                
                // If AI translation is enabled, enhance with dialect-specific translations
                if (CONFIG.FEATURES.AI_TRANSLATION && currentDialect) {
                    const enhancedTranslations = await translate(data, currentDialect);
                    setTranslations(enhancedTranslations);
                    
                    // Cache the translations
                    localStorage.setItem(
                        `translations_${currentLocale}`,
                        JSON.stringify(enhancedTranslations)
                    );
                } else {
                    setTranslations(data);
                    localStorage.setItem(
                        `translations_${currentLocale}`,
                        JSON.stringify(data)
                    );
                }
            } catch (error) {
                console.error('Error loading translations:', error);
                // Fallback to default translations
                const defaultTranslations = await fetch(`/locales/${CONFIG.DEFAULTS.LANGUAGE}.json`);
                setTranslations(await defaultTranslations.json());
            } finally {
                setIsLoading(false);
            }
        };

        loadTranslations();
    }, [currentLocale, currentDialect]);

    // Translation function
    const t = (key, params = {}) => {
        try {
            let translation = key.split('.').reduce((obj, k) => obj[k], translations);
            
            // Replace parameters
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{${param}}`, params[param]);
            });

            return translation || key;
        } catch (error) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    };

    // Change language function
    const changeLanguage = async (locale, dialect = null) => {
        if (CONFIG.LANGUAGES[locale]) {
            setCurrentLocale(locale);
            if (dialect) {
                setCurrentDialect(dialect);
            }
            // Update document direction
            document.dir = CONFIG.LANGUAGES[locale].direction;
            document.documentElement.lang = locale.split('_')[0];
        }
    };

    const value = {
        currentLocale,
        currentDialect,
        translations,
        isLoading,
        t,
        changeLanguage,
        setCurrentDialect,
        supportedLanguages: CONFIG.LANGUAGES
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
