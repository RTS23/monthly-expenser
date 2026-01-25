import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Use Local file for dev by default, or Cloud URL if provided
const url = process.env.TURSO_DATABASE_URL || "file:expenses.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

// Helper to execute SQL
const execute = async (sql, args = []) => {
  try {
    return await client.execute({ sql, args });
  } catch (e) {
    console.error("SQL Execution Error:", e);
    console.error("Failed SQL:", sql);
    console.error("Failed Args:", args);
    throw e;
  }
};

// Initialize Database
const initDb = async () => {
  try {
    await execute(`
            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                userId TEXT DEFAULT NULL,
                username TEXT DEFAULT NULL,
                receiptUrl TEXT DEFAULT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

    await execute(`
            CREATE TABLE IF NOT EXISTS budgets (
                userId TEXT PRIMARY KEY,
                username TEXT,
                amount REAL NOT NULL,
                lastAlertLevel TEXT DEFAULT 'NONE', 
                lastAlertMonth TEXT DEFAULT NULL
            )
        `);

    await execute(`
            CREATE TABLE IF NOT EXISTS recurring_expenses (
                id TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                dayOfMonth INTEGER NOT NULL,
                userId TEXT DEFAULT NULL,
                username TEXT DEFAULT NULL,
                lastGeneratedDate TEXT DEFAULT NULL
            )
        `);

    await execute(`
            CREATE TABLE IF NOT EXISTS monthly_budgets (
                userId TEXT NOT NULL,
                month TEXT NOT NULL,
                amount REAL NOT NULL,
                PRIMARY KEY (userId, month)
            )
        `);
    console.log(`Database initialized using: ${url.startsWith("libsql") ? "Turso (Remote)" : "Local File (Ephemeral)"}`);
  } catch (e) {
    console.error("Failed to init database:", e);
  }
};

export const getDbMode = () => url.startsWith("libsql") ? "Turso" : "Local File";

// Auto-run init
initDb();

export const getRecurringExpenses = async () => {
  const result = await execute('SELECT * FROM recurring_expenses');
  return result.rows;
};

export const addRecurringExpense = async (expense) => {
  const id = uuidv4();
  await execute(`
        INSERT INTO recurring_expenses (id, amount, category, title, dayOfMonth, userId, username, lastGeneratedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
    id,
    expense.amount,
    expense.category,
    expense.title,
    expense.dayOfMonth,
    expense.userId || null,
    expense.username || null,
    null
  ]);
  return { ...expense, id };
};

export const deleteRecurringExpense = async (id) => {
  return await execute('DELETE FROM recurring_expenses WHERE id = ?', [id]);
};

export const updateRecurringExpenseLastGenerated = async (id, date) => {
  return await execute('UPDATE recurring_expenses SET lastGeneratedDate = ? WHERE id = ?', [date, id]);
};

export const getExpenses = async () => {
  const result = await execute('SELECT * FROM expenses ORDER BY date DESC');
  return result.rows;
};

export const addExpense = async (expense) => {
  const id = uuidv4();
  const args = [
    id,
    expense.amount,
    expense.category,
    expense.title,
    expense.date,
    expense.userId || null,
    expense.username || null,
    expense.receiptUrl || null
  ];

  await execute(`
    INSERT INTO expenses (id, amount, category, title, date, userId, username, receiptUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, args);

  // Auto-create budget entry if not exists for this user (default 0)
  if (expense.userId) {
    const result = await execute('SELECT * FROM budgets WHERE userId = ?', [expense.userId]);
    const userBudget = result.rows[0];
    if (!userBudget) {
      await execute('INSERT INTO budgets (userId, username, amount) VALUES (?, ?, ?)', [expense.userId, expense.username, 0]);
    }
  }
  return { ...expense, id };
};

export const deleteExpense = async (id) => {
  return await execute('DELETE FROM expenses WHERE id = ?', [id]);
};

export const updateExpense = async (id, expense) => {
  const args = [
    expense.amount,
    expense.category,
    expense.title,
    expense.date,
    expense.receiptUrl || null,
    id
  ];

  return await execute(`
    UPDATE expenses 
    SET amount = ?, category = ?, title = ?, date = ?, receiptUrl = ?
    WHERE id = ?
  `, args);
};

export const getExpenseById = async (id) => {
  const result = await execute('SELECT * FROM expenses WHERE id = ?', [id]);
  return result.rows[0];
};

export const getAllBudgets = async () => {
  const result = await execute('SELECT * FROM budgets');
  return result.rows;
};

export const getUserBudget = async (userId) => {
  const result = await execute("SELECT amount FROM budgets WHERE userId = ?", [userId]);
  return result.rows[0] ? Number(result.rows[0].amount) : 0; // Default 0
};


export const updateUserBudget = async (userId, username, amount) => {
  const result = await execute('SELECT 1 FROM budgets WHERE userId = ?', [userId]);
  const exists = result.rows.length > 0;

  if (exists) {
    return await execute("UPDATE budgets SET amount = ?, username = ? WHERE userId = ?", [amount, username, userId]);
  } else {
    return await execute("INSERT INTO budgets (userId, username, amount) VALUES (?, ?, ?)", [userId, username, amount]);
  }
};

export const getUserMonthlyBudgets = async (userId) => {
  const result = await execute('SELECT * FROM monthly_budgets WHERE userId = ?', [userId]);
  return result.rows;
};

export const updateUserMonthlyBudget = async (userId, month, amount) => {
  const result = await execute('SELECT 1 FROM monthly_budgets WHERE userId = ? AND month = ?', [userId, month]);
  const exists = result.rows.length > 0;

  if (exists) {
    return await execute("UPDATE monthly_budgets SET amount = ? WHERE userId = ? AND month = ?", [amount, userId, month]);
  } else {
    return await execute("INSERT INTO monthly_budgets (userId, month, amount) VALUES (?, ?, ?)", [userId, month, amount]);
  }
};

export const getExpenseCount = async () => {
  const result = await execute('SELECT COUNT(*) as count FROM expenses');
  return result.rows[0].count;
};

export const getExpenseDistribution = async () => {
  const result = await execute('SELECT userId, COUNT(*) as count FROM expenses GROUP BY userId');
  return result.rows;
};

export const updateBudgetAlert = async (userId, level, month) => {
  return await execute("UPDATE budgets SET lastAlertLevel = ?, lastAlertMonth = ? WHERE userId = ?", [level, month, userId]);
};

// Backwards compatibility for unmodified imports if any
export const getBudget = async () => 2000;

export default client;
