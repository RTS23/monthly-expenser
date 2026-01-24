import { useAuth } from './AuthContext';

// ... (imports)

export function ExpenseProvider({ children }) {
    const { user } = useAuth(); // Get authenticated user
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState({}); // Map of userId -> { amount, username }
    const [defaultBudget, setDefaultBudget] = useState(0); // Default 0 for new users
    // ...

    // ...

    const updateBudget = async (newBudget, month = null) => {
        // Use selectedUser (if admin filtering) OR current authenticated user
        const targetUser = selectedUser || user?.id || 'admin';
        const targetUsername = selectedUser || user?.username || 'Admin';

        try {
            // Optimistic Update / Local State Update BEFORE or AFTER fetch
            // Check if month specific
            if (month) {
                setMonthlyBudgets(prev => {
                    const filtered = prev.filter(m => m.month !== month);
                    return [...filtered, { userId: targetUser, month, amount: newBudget }];
                });
            } else {
                // Update global/default budget map
                setBudgets(prev => ({ ...prev, [targetUsername]: newBudget }));

                // If we are the target user (or default view), update defaultBudget state too for immediate UI reflection
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
                    uniqueUserBudgets.set(normalized, 0); // Default for users without set budget
                }
            }
        });

        // 3. Sum values
        uniqueUserBudgets.forEach(amount => {
            total += amount;
        });

        return total > 0 ? total : 0;
    };

    const currentBudget = selectedUser
        ? (budgets[selectedUser] || 0)
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
