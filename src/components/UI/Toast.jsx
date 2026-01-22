import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const Toast = ({ toast, onDismiss }) => {
    const bgColor = toast.type === 'warning'
        ? 'bg-yellow-500/10 border-yellow-500/50'
        : toast.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/50'
            : 'bg-indigo-500/10 border-indigo-500/50';

    const iconColor = toast.type === 'warning'
        ? 'text-yellow-400'
        : toast.type === 'error'
            ? 'text-rose-400'
            : 'text-indigo-400';

    const Icon = toast.type === 'warning' ? AlertTriangle : AlertCircle;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 ${bgColor}`}>
            <Icon size={20} className={iconColor} />
            <p className="text-sm text-white font-medium">{toast.message}</p>
            <button onClick={onDismiss} className="ml-2 text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
