import { useState, useEffect } from 'react';
import { CONFIG } from '../config/app.config';

export const useGeolocation = () => {
    const [country, setCountry] = useState(null);
    const [city, setCity] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const detectLocation = async () => {
            try {
                // First try to get from cache
                const cachedLocation = localStorage.getItem('user_location');
                if (cachedLocation) {
                    const { country, city, timestamp } = JSON.parse(cachedLocation);
                    const age = Date.now() - timestamp;
                    
                    if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days
                        setCountry(country);
                        setCity(city);
                        setLoading(false);
                        return;
                    }
                }

                // If no cache or expired, detect location
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) {
                    throw new Error('Location detection failed');
                }

                const data = await response.json();
                
                setCountry(data.country_code);
                setCity(data.city);

                // Cache the result
                localStorage.setItem('user_location', JSON.stringify({
                    country: data.country_code,
                    city: data.city,
                    timestamp: Date.now()
                }));

            } catch (err) {
                console.error('Error detecting location:', err);
                setError(err.message);
                
                // Fallback to browser's language settings
                const browserLang = navigator.language;
                if (browserLang) {
                    const country = browserLang.split('-')[1];
                    setCountry(country);
                }
            } finally {
                setLoading(false);
            }
        };

        detectLocation();
    }, []);

    const clearLocationCache = () => {
        localStorage.removeItem('user_location');
    };

    return {
        country,
        city,
        error,
        loading,
        clearLocationCache
    };
};
