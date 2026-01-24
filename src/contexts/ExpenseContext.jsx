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

    // Load from API on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/expenses`, { credentials: 'include' });
            const data = await res.json();
            setExpenses(data.expenses || []);

            const budgetMap = {};
            if (data.budgets) {
                data.budgets.forEach(b => {
                    budgetMap[b.username] = b.amount;
                });
            }
            setBudgets(budgetMap);

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

    const updateBudget = async (newBudget) => {
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
                    amount: newBudget
                })
            });

            setBudgets(prev => ({ ...prev, [targetUsername]: newBudget }));
            setDefaultBudget(newBudget);
        } catch (e) {
            console.error("Failed to update budget", e);
        }
    };

    // Unique Users List (from expenses)
    const users = [...new Set(expenses.map(e => e.username).filter(Boolean))];

    // Derived Budget Logic
    const calculateGlobalBudget = () => {
        let total = 0;
        const allKnownUsers = new Set([...users, ...Object.keys(budgets)]);

        allKnownUsers.forEach(user => {
            total += (budgets[user] || 2000);
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
        budgets
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
}
