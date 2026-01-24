import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export function useExpenses() {
    return useContext(ExpenseContext);
}

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.PROD
    ? '/api'
    : 'http://localhost:3001/api';

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState({}); // Map of userId -> { amount, username }
    const [defaultBudget, setDefaultBudget] = useState(2000);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dateRange, setDateRange] = useState(null); // Date range filter { start, end }
    const [searchQuery, setSearchQuery] = useState(''); // Search filter
    const [categoryFilter, setCategoryFilter] = useState(null); // Category filter
    const [amountRange, setAmountRange] = useState({ min: null, max: null }); // Amount range filter

    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [monthlyBudgets, setMonthlyBudgets] = useState([]);

    // Global Add Expense Modal State
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    // Load from API on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/expenses`, { credentials: 'include' });
            const data = await res.json();
            const { expenses: fetchedExpenses, budgets: fetchedBudgets, monthlyBudgets: fetchedMonthly } = data;

            setExpenses(fetchedExpenses || []);

            const budgetMap = {};
            if (fetchedBudgets) {
                fetchedBudgets.forEach(b => {
                    budgetMap[b.username] = b.amount;
                });
            }
            setBudgets(budgetMap);

            if (Array.isArray(fetchedMonthly)) {
                setMonthlyBudgets(fetchedMonthly);
            }

            // Fetch recurring expenses
            const recRes = await fetch(`${API_URL}/recurring`, { credentials: 'include' });
            if (recRes.ok) {
                const recData = await recRes.json();
                setRecurringExpenses(recData || []);
            }
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
        setIsLoading(false);
    };

    // Calculate Total Savings (Accumulated from past months)
    // Only counts closed past months (before current month)
    const calculateSavings = () => {
        if (expenses.length === 0) return 0;

        let totalSavings = 0;
        const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

        // Group expenses by month
        const expensesByMonth = {};
        expenses.forEach(e => {
            const monthKey = e.date.slice(0, 7);
            if (monthKey < currentMonthKey) { // Only count past months
                expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + Number(e.amount);
            }
        });

        // Determine date range to iterate (from first expense or arbitrary start)
        const dates = expenses.map(e => new Date(e.date));
        if (dates.length === 0) return 0;

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(); // Start of current month
        maxDate.setDate(1);
        maxDate.setHours(0, 0, 0, 0);

        let iterDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

        while (iterDate < maxDate) {
            const monthKey = iterDate.toISOString().slice(0, 7);
            const spent = expensesByMonth[monthKey] || 0;

            // Determine budget for this specific month
            const monthlyEntry = monthlyBudgets.find(mb => mb.month === monthKey);
            // Default to 2000 is a safe fallback if no default budget is loaded yet, but usually we fallback to current admin budget
            const monthBudget = monthlyEntry ? Number(monthlyEntry.amount) : (budgets['Admin'] || 2000);

            totalSavings += (monthBudget - spent);

            iterDate.setMonth(iterDate.getMonth() + 1);
        }

        return totalSavings;
    };

    const savings = calculateSavings();

    const addExpense = async (expenseData) => {
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(expenseData),
            });
            if (res.ok) {
                fetchData(); // Refresh list
            }
        } catch (e) {
            console.error("Failed to add expense", e);
        }
    };

    const addRecurringExpense = async (expenseData) => {
        try {
            const res = await fetch(`${API_URL}/recurring`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(expenseData)
            });
            if (res.ok) {
                const newRec = await res.json();
                setRecurringExpenses(prev => [...prev, newRec]);
            }
        } catch (e) {
            console.error("Failed to add recurring expense", e);
        }
    };

    const deleteRecurringExpense = async (id) => {
        try {
            await fetch(`${API_URL}/recurring/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setRecurringExpenses(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error("Failed to delete recurring expense", e);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setExpenses(prev => prev.filter(exp => exp.id !== id));
        } catch (e) {
            console.error("Failed to delete expense", e);
        }
    };

    const updateExpense = async (id, expenseData) => {
        try {
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(expenseData),
            });
            if (res.ok) {
                // Refetch all data to ensure UI is in sync with database
                fetchData();
            }
        } catch (e) {
            console.error("Failed to update expense", e);
        }
    };

    const updateBudget = async (newBudget, month = null) => {
        const targetUser = selectedUser || 'admin';
        const targetUsername = selectedUser || 'Admin';

        try {
            await fetch(`${API_URL}/budget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: targetUser,
                    username: targetUsername,
                    amount: newBudget,
                    month: month // Optional specific month
                })
            });

            if (month) {
                // Update local monthly budgets state
                setMonthlyBudgets(prev => {
                    const filtered = prev.filter(m => m.month !== month);
                    return [...filtered, { userId: targetUser, month, amount: newBudget }];
                });
            } else {
                // Update global/default budget
                setBudgets(prev => ({ ...prev, [targetUsername]: newBudget }));
                setDefaultBudget(newBudget);
            }
        } catch (e) {
            console.error("Failed to update budget", e);
        }
    };

    // Unique Users List (from expenses)
    const users = [...new Set(expenses.map(e => e.username).filter(Boolean))];

    // Derived Budget Logic
    // Derived Budget Logic
    const calculateGlobalBudget = () => {
        let total = 0;

        // Use a map to track unique users (case-insensitive)
        const uniqueUserBudgets = new Map();

        // 1. Add explicitly set budgets
        Object.entries(budgets).forEach(([username, amount]) => {
            if (username) {
                const normalized = username.toLowerCase();
                // Overwrite if exists, so we keep the explicit value
                uniqueUserBudgets.set(normalized, amount);
            }
        });

        // 2. Check users from expenses for any defaults needed
        expenses.forEach(e => {
            if (e.username) {
                const normalized = e.username.toLowerCase();
                if (!uniqueUserBudgets.has(normalized)) {
                    uniqueUserBudgets.set(normalized, 2000); // Default for users without set budget
                }
            }
        });

        // 3. Sum values
        uniqueUserBudgets.forEach(amount => {
            total += amount;
        });

        return total > 0 ? total : 2000;
    };

    const currentBudget = selectedUser
        ? (budgets[selectedUser] || 2000)
        : calculateGlobalBudget();

    // Filter by User
    let filteredExpenses = selectedUser
        ? expenses.filter(e => e.username === selectedUser)
        : expenses;

    // Filter by Date Range
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

    // Filter by Search Query
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredExpenses = filteredExpenses.filter(e =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.category.toLowerCase().includes(lowerQuery)
        );
    }

    // Filter by Category
    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
    }

    // Filter by Amount Range
    if (amountRange.min !== null || amountRange.max !== null) {
        filteredExpenses = filteredExpenses.filter(e => {
            const amount = Number(e.amount);
            if (amountRange.min !== null && amount < amountRange.min) return false;
            if (amountRange.max !== null && amount > amountRange.max) return false;
            return true;
        });
    }

    // Export to CSV function
    const exportToCSV = () => {
        const headers = ['Date', 'Title', 'Category', 'Amount', 'User'];
        const rows = filteredExpenses.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.title,
            e.category,
            e.amount,
            e.username || 'Unknown'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const rangeLabel = dateRange ? `${dateRange.start}_to_${dateRange.end}` : 'all';
        link.download = `expenses_${rangeLabel}.csv`;
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
