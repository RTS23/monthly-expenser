import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Use relative URL in production, localhost in development
const API_BASE = import.meta.env.PROD
    ? '' // Relative (same origin) or set VITE_API_URL
    : 'http://localhost:3001';

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/user`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error("Auth check failed", e);
            setUser(null);
        }
        setLoading(false);
    };

    const login = () => {
        window.location.href = `${API_BASE}/auth/discord`;
    };

    const logout = () => {
        window.location.href = `${API_BASE}/auth/logout`;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.isAdmin || false
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
