import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n';

const SettingsContext = createContext();

// Fallback exchange rate if API fails
const FALLBACK_RATE = 16000;

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('spendsync_currency') || 'IDR';
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('spendsync_language') || 'id';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('spendsync_theme') || 'dark';
    });

    const [exchangeRate, setExchangeRate] = useState(FALLBACK_RATE);
    const [rateLoading, setRateLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('spendsync_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Fetch live exchange rate
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                setRateLoading(true);
                // Using frankfurter.app - free, no API key required
                const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR');
                const data = await response.json();

                if (data.rates && data.rates.IDR) {
                    setExchangeRate(data.rates.IDR);
                    setLastUpdated(new Date().toLocaleString('id-ID'));
                    // Cache in localStorage
                    localStorage.setItem('spendsync_exchange_rate', JSON.stringify({
                        rate: data.rates.IDR,
                        timestamp: Date.now()
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch exchange rate:', error);
                // Try to use cached rate
                const cached = localStorage.getItem('spendsync_exchange_rate');
                if (cached) {
                    const { rate } = JSON.parse(cached);
                    setExchangeRate(rate);
                }
            } finally {
                setRateLoading(false);
            }
        };

        // Check cache first (valid for 1 hour)
        const cached = localStorage.getItem('spendsync_exchange_rate');
        if (cached) {
            const { rate, timestamp } = JSON.parse(cached);
            const oneHour = 60 * 60 * 1000;
            if (Date.now() - timestamp < oneHour) {
                setExchangeRate(rate);
                setLastUpdated(new Date(timestamp).toLocaleString('id-ID'));
                setRateLoading(false);
                return;
            }
        }

        fetchExchangeRate();

        // Refresh every hour
        const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('spendsync_currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('spendsync_language', language);
    }, [language]);

    // Translation helper
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language] || translations.en;

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    // Convert from base currency (USD) to display currency
    const fromBaseCurrency = (amount) => {
        const num = Number(amount);
        if (currency === 'IDR') {
            return num * exchangeRate;
        }
        return num;
    };

    // Convert from display currency to base currency (USD) for storage
    const toBaseCurrency = (amount) => {
        const num = Number(amount);
        if (currency === 'IDR') {
            return num / exchangeRate;
        }
        return num;
    };

    // Currency formatter
    const formatCurrency = (amount, isBaseAmount = true) => {
        const displayAmount = isBaseAmount ? fromBaseCurrency(amount) : amount;

        if (currency === 'IDR') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(displayAmount);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(displayAmount);
    };

    const getCurrencySymbol = () => currency === 'IDR' ? 'Rp' : '$';

    const value = {
        currency,
        setCurrency,
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        formatCurrency,
        toBaseCurrency,
        fromBaseCurrency,
        getCurrencySymbol,
        exchangeRate,
        rateLoading,
        lastUpdated,
        EXCHANGE_RATE: exchangeRate // Alias for compatibility
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
