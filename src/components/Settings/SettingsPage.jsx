import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Globe, DollarSign } from 'lucide-react';

const SettingsPage = () => {
    const { currency, setCurrency, language, setLanguage, t } = useSettings();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Globe className="text-indigo-400" size={24} />
                    {t('settings.title')}
                </h2>

                <div className="space-y-6">
                    {/* Language Setting */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                        <div>
                            <h3 className="font-medium text-white">{t('settings.language')}</h3>
                            <p className="text-sm text-slate-400">Choose your preferred language</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'en'
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                            <button
                                onClick={() => setLanguage('id')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'id'
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                🇮🇩 Indonesia
                            </button>
                        </div>
                    </div>

                    {/* Currency Setting */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                        <div>
                            <h3 className="font-medium text-white">{t('settings.currency')}</h3>
                            <p className="text-sm text-slate-400">Choose your currency format</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === 'USD'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                $ USD
                            </button>
                            <button
                                onClick={() => setCurrency('IDR')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === 'IDR'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                Rp IDR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
