import React, { useState } from 'react';
import { LayoutDashboard, Wallet, Settings, CreditCard, LogOut, ChevronDown, Repeat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

// SpendSync Logo Component
const Logo = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10">
        <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                <stop offset="100%" style={{ stopColor: '#a855f7' }} />
            </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="#0f172a" />
        <path d="M22 12c0-3.3-2.7-6-6-6s-6 2.7-6 6" stroke="url(#logoGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M10 20c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="url(#logoGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="10" cy="12" r="2" fill="url(#logoGrad)" />
        <circle cx="22" cy="20" r="2" fill="url(#logoGrad)" />
    </svg>
);

const Shell = ({ children, activeTab, onTabChange }) => {
    const { logout, user } = useAuth();
    const { t, language } = useSettings();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
        { id: 'expenses', icon: CreditCard, label: t('nav.expenses') },
        { id: 'budget', icon: Wallet, label: t('nav.budget') },
        { id: 'recurring', icon: Repeat, label: language === 'id' ? 'Rutin' : 'Recurring' },
    ];

    return (
        <div className="flex h-screen w-full bg-[hsl(var(--bg-app))] text-main overflow-hidden">
            {/* Sidebar - Glassmorphism */}
            <aside className="w-20 lg:w-64 glass-panel flex-shrink-0 flex flex-col items-center lg:items-start py-8 transition-all duration-300 z-10 m-4 rounded-2xl">
                <div className="px-4 mb-12 flex items-center justify-center lg:justify-start w-full gap-3">
                    <div className="flex-shrink-0 shadow-lg shadow-indigo-500/20 rounded-xl">
                        <Logo />
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-main">
                            SpendSync
                        </span>
                        <span className="text-[10px] text-muted uppercase tracking-wider">Expense Tracker</span>
                    </div>
                </div>

                <nav className="flex-1 w-full flex flex-col gap-2 px-2 lg:px-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`
                  relative flex items-center justify-center lg:justify-start w-full p-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                        : 'text-muted hover:bg-slate-800/50 hover:text-main'
                                    }
                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full hidden lg:block" />
                                )}
                                <Icon size={24} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto px-2 lg:px-4 w-full relative">
                    {user && (
                        <>
                            {/* Profile Button */}
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 lg:p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 text-left"
                            >
                                {user.avatar ? (
                                    <img
                                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                                        alt="User"
                                        className="w-10 h-10 rounded-full ring-2 ring-slate-900 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center ring-2 ring-slate-900 flex-shrink-0">
                                        <span className="text-sm font-bold text-indigo-400">
                                            {user.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="hidden lg:block overflow-hidden flex-1">
                                    <p className="text-sm font-semibold truncate text-main">{user.username}</p>
                                    <p className="text-xs text-muted truncate">Online</p>
                                </div>
                                <div className="hidden lg:block text-slate-500">
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Dropdown Menu - Mobile Optimized */}
                            {isProfileOpen && (
                                <div className="absolute bottom-full left-0 w-full mb-2 px-2 lg:px-4 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                                    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl overflow-hidden p-1.5">
                                        {/* Mobile: Show username in dropdown */}
                                        <div className="lg:hidden px-3 py-2 border-b border-slate-700/50 mb-1">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center justify-center lg:justify-start gap-2 p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
                                        >
                                            <LogOut size={16} />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-hidden relative">
                {/* Animated Aurora Background - theme-aware */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none aurora-blob bg-purple-600/20 dark:bg-purple-600/20" style={{ background: 'var(--aurora-1, rgba(147, 51, 234, 0.2))' }} />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none aurora-blob-delay bg-indigo-600/20 dark:bg-indigo-600/20" style={{ background: 'var(--aurora-2, rgba(99, 102, 241, 0.2))' }} />
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none aurora-blob bg-pink-600/10 dark:bg-pink-600/10" style={{ background: 'var(--aurora-3, rgba(236, 72, 153, 0.1))', animationDelay: '5s' }} />

                <div className="h-full overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Shell;
