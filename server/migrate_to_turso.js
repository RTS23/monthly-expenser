import Database from 'better-sqlite3';
import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
dotenv.config();

// 1. Source: Local SQLite File
const localDb = new Database('expenses.db');

// 2. Dest: Turso (or whatever is in env)
// NOTE: User must set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env before running this
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoUrl.includes('libsql')) {
    console.error("❌ TURSO_DATABASE_URL not found or invalid in .env");
    console.log("Please create a database on Turso, get the URL and Token, and add them to .env");
    process.exit(1);
}

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

const migrate = async () => {
    console.log("🚀 Starting migration to Turso...");

    // 0. Ensure Tables Exist
    try {
        console.log("📦 Creating tables if they don't exist...");
        await turso.execute(`
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

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS budgets (
                userId TEXT PRIMARY KEY,
                username TEXT,
                amount REAL NOT NULL,
                lastAlertLevel TEXT DEFAULT 'NONE', 
                lastAlertMonth TEXT DEFAULT NULL
            )
        `);

        await turso.execute(`
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
        console.log("✅ Tables verified.");
    } catch (e) {
        console.error("Error creating tables:", e);
        // Continue anyway, maybe they exist
    }

    // A. Migrate Expenses
    try {
        const expenses = localDb.prepare('SELECT * FROM expenses').all();
        console.log(`Found ${expenses.length} expenses to migrate.`);

        // Batch insert or one-by-one? One-by-one is safer for now.
        for (const exp of expenses) {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO expenses (id, amount, category, title, date, userId, username, receiptUrl, timestamp) 
                      VALUES (:id, :amount, :category, :title, :date, :userId, :username, :receiptUrl, :timestamp)`,
                args: {
                    id: exp.id,
                    amount: exp.amount,
                    category: exp.category,
                    title: exp.title,
                    date: exp.date,
                    userId: exp.userId,
                    username: exp.username,
                    receiptUrl: exp.receiptUrl,
                    timestamp: exp.timestamp
                }
            });
        }
        console.log("✅ Expenses migrated.");
    } catch (e) {
        console.error("Error migrating expenses:", e);
    }

    // B. Migrate Budgets
    try {
        const budgets = localDb.prepare('SELECT * FROM budgets').all();
        console.log(`Found ${budgets.length} budgets to migrate.`);

        for (const b of budgets) {
            // Handle potential missing columns in old DB if any
            const lastAlertLevel = b.lastAlertLevel || 'NONE';
            const lastAlertMonth = b.lastAlertMonth || null;

            await turso.execute({
                sql: `INSERT OR REPLACE INTO budgets (userId, username, amount, lastAlertLevel, lastAlertMonth) 
                      VALUES (:userId, :username, :amount, :lastAlertLevel, :lastAlertMonth)`,
                args: {
                    userId: b.userId,
                    username: b.username,
                    amount: b.amount,
                    lastAlertLevel,
                    lastAlertMonth
                }
            });
        }
        console.log("✅ Budgets migrated.");
    } catch (e) {
        console.error("Error migrating budgets (tables might not exist yet):", e);
    }

    // C. Migrate Recurring
    try {
        const recurring = localDb.prepare('SELECT * FROM recurring_expenses').all();
        console.log(`Found ${recurring.length} recurring expenses.`);

        for (const rec of recurring) {
            await turso.execute({
                sql: `INSERT OR REPLACE INTO recurring_expenses (id, amount, category, title, dayOfMonth, userId, username, lastGeneratedDate)
                      VALUES (:id, :amount, :category, :title, :dayOfMonth, :userId, :username, :lastGeneratedDate)`,
                args: {
                    id: rec.id,
                    amount: rec.amount,
                    category: rec.category,
                    title: rec.title,
                    dayOfMonth: rec.dayOfMonth,
                    userId: rec.userId,
                    username: rec.username,
                    lastGeneratedDate: rec.lastGeneratedDate
                }
            });
        }
        console.log("✅ Recurring expenses migrated.");
    } catch (e) {
        console.error("Error migrating recurring:", e);
    }

    console.log("🎉 Migration Complete!");
};

migrate();
