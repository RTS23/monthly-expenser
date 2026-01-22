import Database from 'better-sqlite3';

const db = new Database('expenses.db');

const addColumn = (columnName, colDef) => {
    try {
        console.log(`Attempting to add ${columnName} column to budgets table...`);
        db.exec(`ALTER TABLE budgets ADD COLUMN ${columnName} ${colDef}`);
        console.log(`Successfully added ${columnName} column.`);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log(`Column ${columnName} already exists.`);
        } else {
            console.error(`Error adding ${columnName}:`, error);
        }
    }
}

addColumn('lastAlertLevel', "TEXT DEFAULT 'NONE'"); // 'NONE', '80', '100'
addColumn('lastAlertMonth', "TEXT DEFAULT NULL");   // 'YYYY-MM'
