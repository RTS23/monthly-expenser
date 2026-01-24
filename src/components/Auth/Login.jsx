import React from 'react';

// SpendSync Logo Component
const Logo = () => (
    <svg viewBox="0 0 32 32" className="w-16 h-16">
        <defs>
            <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                <stop offset="100%" style={{ stopColor: '#a855f7' }} />
            </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="#1e293b" />
        <path d="M22 12c0-3.3-2.7-6-6-6s-6 2.7-6 6" stroke="url(#loginLogoGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M10 20c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="url(#loginLogoGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="10" cy="12" r="2" fill="url(#loginLogoGrad)" />
        <circle cx="22" cy="20" r="2" fill="url(#loginLogoGrad)" />
    </svg>
);

const Login = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center space-y-6 relative z-10">
                <div className="flex justify-center">
                    <div className="p-4 bg-slate-800/50 rounded-2xl ring-1 ring-slate-700/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                        <Logo />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Etoile</h1>
                    <p className="text-slate-400">Welcome to <span className="text-indigo-400">Etoile</span>. Sync with Discord. Stay on budget.</p>
                </div>

                <button
                    onClick={onLogin}
                    className="w-full py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/25"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                    </svg>
                    Login with Discord
                </button>
            </div>
        </div>
    );
};

export default Login;
