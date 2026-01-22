import Database from 'better-sqlite3';

const db = new Database('expenses.db');

try {
    console.log('Attempting to add receiptUrl column to expenses table...');
    db.exec('ALTER TABLE expenses ADD COLUMN receiptUrl TEXT DEFAULT NULL');
    console.log('Successfully added receiptUrl column.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column receiptUrl already exists.');
    } else {
        console.error('Error altering table:', error);
    }
}
