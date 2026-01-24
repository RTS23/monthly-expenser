import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, CreditCard, LogOut, ChevronDown, Repeat, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

// Etoile Logo Component
const Logo = ({ size = 'md' }) => (
    <img
        src="/logo.png"
        alt="Etoile Logo"
        className={`${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} object-contain`}
    />
);

const Shell = ({ children, activeTab, onTabChange }) => {
    const { logout, user } = useAuth();
    const { t, language } = useSettings();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
        { id: 'expenses', icon: CreditCard, label: t('nav.expenses') },
        { id: 'budget', icon: Wallet, label: t('nav.budget') },
        { id: 'recurring', icon: Repeat, label: language === 'id' ? 'Rutin' : 'Recurring' },
    ];

    // Close sidebar when tab changes
    const handleTabChange = (tabId) => {
        onTabChange(tabId);
        setIsSidebarOpen(false);
    };

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen w-full bg-[hsl(var(--bg-app))] text-main overflow-hidden">
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <Menu size={22} className="text-slate-300" />
                </button>
                <div className="flex items-center gap-2">
                    <Logo size="sm" />
                    <span className="font-bold text-sm text-main">Etoile</span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Collapsible on mobile */}
            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-50
                w-64 glass-panel flex-shrink-0 flex flex-col py-6 lg:py-8
                transition-transform duration-300 ease-out
                lg:translate-x-0 lg:m-4 lg:rounded-2xl
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Mobile close button */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <X size={20} className="text-slate-400" />
                </button>

                {/* Logo */}
                <div className="px-4 mb-8 lg:mb-12 flex items-center gap-3">
                    <div className="flex-shrink-0 shadow-lg shadow-indigo-500/20 rounded-xl overflow-hidden">
                        <Logo />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-main">Etoile</span>
                        <span className="text-[10px] text-muted uppercase tracking-wider">Financial Star</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full flex flex-col gap-2 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                data-tour={item.id === 'budget' ? 'manage-budget-link' : item.id === 'recurring' ? 'recurring-link' : undefined}
                                className={`
                                    relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                        : 'text-muted hover:bg-slate-800/50 hover:text-main'
                                    }
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon size={22} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="ml-3 font-medium text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Section */}
                <div className="mt-auto px-3 w-full relative">
                    {user && (
                        <>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50"
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
                                <div className="overflow-hidden flex-1 text-left">
                                    <p className="text-sm font-semibold truncate text-main">{user.username}</p>
                                    <p className="text-xs text-muted truncate">Online</p>
                                </div>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute bottom-full left-0 w-full mb-2 px-3 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                                    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl overflow-hidden p-1.5">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsSidebarOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
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
            <main className="flex-1 h-full overflow-hidden relative pt-14 lg:pt-0">
                {/* Animated Aurora Background */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none aurora-blob bg-purple-600/20" style={{ background: 'var(--aurora-1, rgba(147, 51, 234, 0.2))' }} />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none aurora-blob-delay bg-indigo-600/20" style={{ background: 'var(--aurora-2, rgba(99, 102, 241, 0.2))' }} />
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none aurora-blob bg-pink-600/10" style={{ background: 'var(--aurora-3, rgba(236, 72, 153, 0.1))', animationDelay: '5s' }} />

                <div className="h-full overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Shell;
