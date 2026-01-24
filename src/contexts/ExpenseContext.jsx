import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export function useExpenses() {
    return useContext(ExpenseContext);
}

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.PROD
    ? '/api'
    : 'http://localhost:3001/api';

export function ExpenseProvider({ children }) {
    const { user } = useAuth(); // Get authenticated user
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState({}); // Map of username -> amount
    const [monthlyBudgets, setMonthlyBudgets] = useState([]);
    const [defaultBudget, setDefaultBudget] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Filters & UI State
    const [selectedUser, setSelectedUser] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [amountRange, setAmountRange] = useState({ min: null, max: null });
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    const [recurringExpenses, setRecurringExpenses] = useState([]);

    // Data Fetching
    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch Expenses & Budgets
            const res = await fetch(`${API_URL}/expenses`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setExpenses(data.expenses || []);

                // Convert budgets array to map
                const budgetMap = {};
                if (data.budgets) {
                    data.budgets.forEach(b => {
                        if (b.username) budgetMap[b.username] = b.amount;
                    });
                }
                setBudgets(budgetMap);
                setMonthlyBudgets(data.monthlyBudgets || []);
            }

            // Fetch Recurring Expenses
            const resRec = await fetch(`${API_URL}/recurring`, { credentials: 'include' });
            if (resRec.ok) {
                const recData = await resRec.json();
                setRecurringExpenses(recData || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Unique Users List
    const users = [...new Set(expenses.map(e => e.username).filter(Boolean))];

    // Derived Budget Logic
    const calculateGlobalBudget = () => {
        let total = 0;
        const uniqueUserBudgets = new Map();

        // 1. Explicit budgets
        Object.entries(budgets).forEach(([username, amount]) => {
            if (username) uniqueUserBudgets.set(username.toLowerCase(), amount);
        });

        // 2. Default for others
        expenses.forEach(e => {
            if (e.username) {
                const normalized = e.username.toLowerCase();
                if (!uniqueUserBudgets.has(normalized)) uniqueUserBudgets.set(normalized, 0);
            }
        });

        uniqueUserBudgets.forEach(amount => total += amount);
        return total > 0 ? total : 0;
    };

    const currentBudget = selectedUser
        ? (budgets[selectedUser] || 0)
        : calculateGlobalBudget();

    // Update Budget Logic
    const updateBudget = async (newBudget, month = null) => {
        const targetUser = selectedUser || user?.id || 'admin';
        const targetUsername = selectedUser || user?.username || 'Admin';

        try {
            // Optimistic Update
            if (month) {
                setMonthlyBudgets(prev => {
                    const filtered = prev.filter(m => m.month !== month);
                    return [...filtered, { userId: targetUser, month, amount: newBudget }];
                });
            } else {
                setBudgets(prev => ({ ...prev, [targetUsername]: newBudget }));
                if (!selectedUser || selectedUser === targetUsername) {
                    setDefaultBudget(newBudget);
                }
            }

            await fetch(`${API_URL}/budget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: targetUser,
                    username: targetUsername,
                    amount: newBudget,
                    month: month
                })
            });
        } catch (e) {
            console.error("Failed to update budget", e);
        }
    };

    // Actions
    const addExpense = async (expenseData) => {
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(expenseData)
            });
            if (res.ok) {
                const newExpense = await res.json();
                setExpenses(prev => [newExpense, ...prev]);
                return true;
            }
        } catch (e) {
            console.error("Failed to add expense", e);
        }
        return false;
    };

    const deleteExpense = async (id) => {
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', credentials: 'include' });
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (e) {
            console.error("Failed to delete expense", e);
        }
    };

    const updateExpense = async (id, data) => {
        try {
            await fetch(`${API_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        } catch (e) {
            console.error("Failed to update expense", e);
        }
    };

    const addRecurringExpense = async (data) => {
        try {
            const res = await fetch(`${API_URL}/recurring`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const newRec = await res.json();
                setRecurringExpenses(prev => [...prev, newRec]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteRecurringExpense = async (id) => {
        try {
            await fetch(`${API_URL}/recurring/${id}`, { method: 'DELETE', credentials: 'include' });
            setRecurringExpenses(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    // Filters
    let filteredExpenses = selectedUser
        ? expenses.filter(e => e.username === selectedUser)
        : expenses;

    if (dateRange?.start && dateRange?.end) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        filteredExpenses = filteredExpenses.filter(e => {
            const expDate = new Date(e.date);
            return expDate >= startDate && expDate <= endDate;
        });
    }

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredExpenses = filteredExpenses.filter(e =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.category.toLowerCase().includes(lowerQuery)
        );
    }

    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
    }

    if (amountRange.min !== null || amountRange.max !== null) {
        filteredExpenses = filteredExpenses.filter(e => {
            const amount = Number(e.amount);
            if (amountRange.min !== null && amount < amountRange.min) return false;
            if (amountRange.max !== null && amount > amountRange.max) return false;
            return true;
        });
    }

    // Savings Calculation (Current Budget - Filtered Spend)
    const totalSpent = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const savings = currentBudget - totalSpent;

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Date', 'Title', 'Category', 'Amount', 'User'];
        const rows = filteredExpenses.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.title,
            e.category,
            e.amount,
            e.username || 'Unknown'
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expenses.csv`;
        link.click();
    };

    const value = {
        expenses: filteredExpenses,
        allExpenses: expenses,
        budget: currentBudget,
        addExpense,
        deleteExpense,
        updateExpense,
        updateBudget,
        isLoading,
        users,
        selectedUser,
        setSelectedUser,
        dateRange,
        setDateRange,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        amountRange,
        setAmountRange,
        recurringExpenses,
        addRecurringExpense,
        deleteRecurringExpense,
        exportToCSV,
        budgets,
        monthlyBudgets,
        savings,
        isAddExpenseOpen,
        setIsAddExpenseOpen
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
}
