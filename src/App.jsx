import React, { useState, useEffect } from 'react';
import { ExpenseProvider, useExpenses } from './contexts/ExpenseContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './components/UI/Toast';
import Shell from './components/Layout/Shell';
import Overview from './components/Dashboard/Overview';
import ExpenseList from './components/Expenses/ExpenseList';
import AddExpenseForm from './components/Expenses/AddExpenseForm';
import BudgetSettings from './components/Budget/BudgetSettings';
import UserFilter from './components/Dashboard/UserFilter';
import RecurringExpenses from './components/Budget/RecurringExpenses';
import GroupAnalytics from './components/Dashboard/GroupAnalytics';
import PersonalAnalytics from './components/Dashboard/PersonalAnalytics';
import DateRangeFilter from './components/Dashboard/DateRangeFilter';
import SearchBar from './components/Dashboard/SearchBar';
import QuickSettings from './components/UI/QuickSettings';
import Login from './components/Auth/Login';
import AppTour from './components/Common/AppTour';

const AuthGuard = ({ children }) => {
    const { user, loading, login } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Login onLogin={login} />;
    }

    return children;
};

// Budget Warning Effect Component
const BudgetWarningEffect = () => {
    const { expenses, budget } = useExpenses();
    const { showToast } = useToast();
    const { t } = useSettings();
    const [hasWarned80, setHasWarned80] = useState(false);
    const [hasWarned100, setHasWarned100] = useState(false);

    useEffect(() => {
        const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const percentage = (totalSpent / budget) * 100;

        if (percentage >= 100 && !hasWarned100) {
            showToast(`⚠️ ${t('toasts.budgetExceeded')}`, 'error');
            setHasWarned100(true);
        } else if (percentage >= 80 && percentage < 100 && !hasWarned80) {
            showToast(`📊 ${t('toasts.budgetWarning')}`, 'warning');
            setHasWarned80(true);
        }
    }, [expenses, budget, hasWarned80, hasWarned100, showToast, t]);

    return null;
};

const MainContent = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { users, selectedUser, setSelectedUser, dateRange, setDateRange, searchQuery, setSearchQuery } = useExpenses();
    const { isAdmin } = useAuth();
    const { t, language } = useSettings();

    return (
        <Shell activeTab={activeTab} onTabChange={setActiveTab}>
            <BudgetWarningEffect />

            {/* Floating Add Expense Button - Only on dashboard/expenses */}
            {(activeTab === 'dashboard' || activeTab === 'expenses') && <AddExpenseForm />}

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header with Quick Settings */}
                <header className="mb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-main">
                                {activeTab === 'dashboard' ? t('nav.dashboard') :
                                    activeTab === 'expenses' ? t('nav.expenses') :
                                        activeTab === 'budget' ? t('nav.budget') :
                                            language === 'id' ? 'Pengeluaran Rutin' : 'Recurring Expenses'}
                            </h1>
                            <p className="text-muted">{t('dashboard.subtitle')}</p>
                        </div>
                        <QuickSettings />
                    </div>
                </header>

                {/* Filters Row */}
                {(activeTab === 'dashboard' || activeTab === 'expenses') && (
                    <div data-tour="filters" className="flex flex-wrap items-center gap-3">
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                        {isAdmin && (
                            <UserFilter
                                users={users}
                                selectedUser={selectedUser}
                                onSelectUser={setSelectedUser}
                            />
                        )}
                        <DateRangeFilter
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Overview />

                        {selectedUser || !isAdmin ? (
                            <>
                                <PersonalAnalytics />
                                <div className="mt-8">
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            {selectedUser ? `${selectedUser}'s Activity` : t('dashboard.recentActivity')}
                                        </h3>
                                    </div>
                                    <ExpenseList />
                                </div>
                            </>
                        ) : (
                            <>
                                <GroupAnalytics />
                                <div className="mt-8">
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <h3 className="text-lg font-semibold text-white">{t('dashboard.recentGroupActivity')}</h3>
                                    </div>
                                    <ExpenseList />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <ExpenseList />
                    </div>
                )}

                {activeTab === 'budget' && (
                    <div className="animate-in fade-in duration-500">
                        <BudgetSettings />
                    </div>
                )}

                {activeTab === 'recurring' && (
                    <div className="animate-in fade-in duration-500">
                        <RecurringExpenses />
                    </div>
                )}
            </div>
            <AppTour />
        </Shell>
    );
};

function App() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <ToastProvider>
                    <AuthGuard>
                        <ExpenseProvider>
                            <MainContent />
                        </ExpenseProvider>
                    </AuthGuard>
                </ToastProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}

export default App;
