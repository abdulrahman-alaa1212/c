import { useState } from 'react';
import { CONFIG } from '../config/app.config';

export const useAITranslation = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    const translate = async (content, targetDialect) => {
        if (!CONFIG.FEATURES.AI_TRANSLATION) {
            return content;
        }

        setIsTranslating(true);
        setError(null);

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/ai/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.AI.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    content,
                    targetDialect,
                    model: CONFIG.AI.TRANSLATION_MODEL,
                    maxTokens: CONFIG.AI.MAX_TOKENS
                })
            });

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const translatedContent = await response.json();

            // Cache the translation
            const cacheKey = `translation_${JSON.stringify(content)}_${targetDialect}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                content: translatedContent,
                timestamp: Date.now()
            }));

            return translatedContent;
        } catch (err) {
            setError(err.message);
            // Return original content if translation fails
            return content;
        } finally {
            setIsTranslating(false);
        }
    };

    const getDialectPrompt = (dialect) => {
        const prompts = {
            egyptian: 'Translate this to Egyptian Arabic dialect, maintaining a friendly and casual tone',
            gulf: 'Translate this to Gulf Arabic dialect, maintaining a formal and respectful tone',
            levantine: 'Translate this to Levantine Arabic dialect, maintaining a balanced tone',
            moroccan: 'Translate this to Moroccan Arabic dialect, maintaining local expressions',
            // Add more dialect prompts as needed
        };

        return prompts[dialect] || 'Translate this maintaining the original tone';
    };

    const detectDialect = async (text) => {
        if (!CONFIG.FEATURES.DIALECT_DETECTION) {
            return null;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/ai/detect-dialect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.AI.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    text,
                    model: CONFIG.AI.DEFAULT_MODEL
                })
            });

            if (!response.ok) {
                throw new Error('Dialect detection failed');
            }

            const { dialect } = await response.json();
            return dialect;
        } catch (err) {
            console.error('Error detecting dialect:', err);
            return null;
        }
    };

    const clearTranslationCache = () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('translation_')) {
                const cached = JSON.parse(localStorage.getItem(key));
                const age = Date.now() - cached.timestamp;
                
                if (age > CONFIG.CACHE.TRANSLATION_TTL) {
                    localStorage.removeItem(key);
                }
            }
        });
    };

    // Clear expired cache entries periodically
    setInterval(clearTranslationCache, 24 * 60 * 60 * 1000); // Once a day

    return {
        translate,
        detectDialect,
        isTranslating,
        error,
        clearTranslationCache
    };
};
