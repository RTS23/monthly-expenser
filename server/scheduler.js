import cron from 'node-cron';
import { getRecurringExpenses, addExpense, updateRecurringExpenseLastGenerated, getAllBudgets, getExpenses, updateBudgetAlert } from './database.js';
import { sendDM } from './bot.js';

export const startScheduler = () => {
    // Run every day at 00:01 AM (Recurring Expenses)
    cron.schedule('1 0 * * *', async () => {
        console.log('Running recurring expense scheduler...');

        const today = new Date();
        if (today.getDate() === 1) {
            console.log('📅 First day of the month! Performing monthly maintenance...');
        }

        await checkRecurringExpenses();
    });

    // Run every hour to check Budget Alerts
    cron.schedule('0 * * * *', async () => {
        console.log('Running budget alert check...');
        await checkBudgetAlerts();
    });

    // Run immediately on startup for testing
    checkBudgetAlerts();
};

export const checkRecurringExpenses = async () => {
    const recurring = await getRecurringExpenses();
    const today = new Date();
    const dayOfMonth = today.getDate();
    const todayStr = today.toISOString().split('T')[0];

    for (const rec of recurring) {
        if (rec.dayOfMonth === dayOfMonth) {
            if (rec.lastGeneratedDate !== todayStr) {
                console.log(`Generating recurring expense: ${rec.title}`);
                try {
                    await addExpense({
                        amount: rec.amount,
                        category: rec.category,
                        title: `${rec.title} (Recurring)`,
                        date: today.toISOString(),
                        userId: rec.userId,
                        username: rec.username
                    });
                    await updateRecurringExpenseLastGenerated(rec.id, todayStr);
                } catch (e) {
                    console.error(`Failed to generate recurring expense ${rec.id}:`, e);
                }
            }
        }
    }
};

export const checkBudgetAlerts = async () => {
    const budgets = await getAllBudgets();
    const expenses = await getExpenses();
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

    for (const budget of budgets) {
        // Skip if no user ID (shouldn't happen but safe guard)
        if (!budget.userId) continue;

        // Reset alert status if it's a new month
        if (budget.lastAlertMonth !== currentMonth) {
            await updateBudgetAlert(budget.userId, 'NONE', currentMonth);
            budget.lastAlertLevel = 'NONE'; // Local update for current loop
        }

        // Calculate spending for this month
        const userExpenses = expenses.filter(e =>
            e.userId === budget.userId &&
            e.date.startsWith(currentMonth)
        );
        const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = (totalSpent / budget.amount) * 100;

        let alertToSend = null;
        let newLevel = budget.lastAlertLevel;

        // CRITICAL ALERT (100%)
        if (percentage >= 100 && budget.lastAlertLevel !== '100') {
            alertToSend = `🚨 **CRITICAL ALERT:** You have exceeded your monthly budget of **$${budget.amount}**!\nTotal Spent: **$${totalSpent}** (${percentage.toFixed(1)}%)`;
            newLevel = '100';
        }
        // WARNING ALERT (80%)
        else if (percentage >= 80 && percentage < 100 && budget.lastAlertLevel === 'NONE') {
            alertToSend = `⚠️ **BUDGET WARNING:** You have used **${percentage.toFixed(1)}%** of your budget ($${budget.amount}).\nRemaining: **$${budget.amount - totalSpent}**`;
            newLevel = '80';
        }

        if (alertToSend) {
            const sent = await sendDM(budget.userId, alertToSend);
            if (sent) {
                await updateBudgetAlert(budget.userId, newLevel, currentMonth);
            }
        }
    }
};
