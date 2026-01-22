import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ChevronDown, Sun, Moon, HelpCircle } from 'lucide-react';

// ... (other components)

// Combined Quick Settings Row
const QuickSettings = () => {
    const restartTour = () => {
        console.log("Restarting tour...");
        localStorage.removeItem('hasSeenTour_v1');
        window.location.reload();
    };

    console.log("QuickSettings Rendered - Version 2");

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={restartTour}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-300"
                title="Restart Tour (Debug)"
            >
                <HelpCircle size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <ThemeSwitcher />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <LanguageSwitcher />
            <CurrencySwitcher />
        </div>
    );
};

export default QuickSettings;
