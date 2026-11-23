const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const fs = require('fs');
const path = require('path');

let db;

async function initDatabase() {
    db = await sqlite.open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='records'");
    
    if (!tableCheck) {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await db.exec(schema);
        await db.exec(seed);
        console.log("Database initialized and seeded.");
    }
}

initDatabase().catch(console.error);

module.exports = {
    query: (sql, params) => db.all(sql, params),
    run: (sql, params) => db.run(sql, params),
    get: (sql, params) => db.get(sql, params)
};
