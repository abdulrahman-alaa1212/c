export const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
        TIMEOUT: 15000,
        RETRY_ATTEMPTS: 3
    },

    // AI Services
    AI: {
        OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
        DEFAULT_MODEL: 'gpt-4',
        TRANSLATION_MODEL: 'gpt-4',
        MAX_TOKENS: 2000
    },

    // Supported Languages
    LANGUAGES: {
        ar_EG: {
            name: 'العربية (مصر)',
            direction: 'rtl',
            dateFormat: 'DD/MM/YYYY',
            dialect: 'egyptian'
        },
        ar_SA: {
            name: 'العربية (السعودية)',
            direction: 'rtl',
            dateFormat: 'DD/MM/YYYY',
            dialect: 'gulf'
        },
        en_US: {
            name: 'English (US)',
            direction: 'ltr',
            dateFormat: 'MM/DD/YYYY',
            dialect: 'american'
        },
        en_GB: {
            name: 'English (UK)',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            dialect: 'british'
        }
    },

    // Default Settings
    DEFAULTS: {
        LANGUAGE: 'ar_EG',
        THEME: 'light',
        ANIMATION: true,
        FONT_SIZE: 'medium'
    },

    // Feature Flags
    FEATURES: {
        AI_TRANSLATION: true,
        DIALECT_DETECTION: true,
        THEME_SWITCHER: true,
        ACCESSIBILITY: true
    },

    // Cache Configuration
    CACHE: {
        TRANSLATION_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        USER_PREFERENCES_TTL: 30 * 24 * 60 * 60 * 1000 // 30 days
    },

    // Analytics
    ANALYTICS: {
        ENABLED: true,
        PROVIDER: 'google-analytics',
        TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID
    }
};
