import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const client = createClient({
    url: process.env.DB_URL || 'file:expenses.db',
    authToken: process.env.DB_TOKEN,
});

async function migrate() {
    try {
        console.log('Starting migration: monthly_budgets table...');

        await client.execute(`
      CREATE TABLE IF NOT EXISTS monthly_budgets (
        userId TEXT NOT NULL,
        month TEXT NOT NULL, -- Format: YYYY-MM
        amount REAL NOT NULL,
        PRIMARY KEY (userId, month)
      )
    `);

        console.log('Migration successful: monthly_budgets table created.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
