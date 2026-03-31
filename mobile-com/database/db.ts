import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("focus.db");

export async function initDB() {

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      completed INTEGER DEFAULT 0
    );
  `);
  try {
    await db.execAsync(`ALTER TABLE tasks ADD COLUMN completed INTEGER DEFAULT 0;`);
  } catch (e) {}

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS timer_records(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      duration INTEGER,
      created_at TEXT,
      day TEXT
    );
  `);
  try {
    await db.execAsync(`ALTER TABLE timer_records ADD COLUMN day TEXT;`);
  } catch (e) {}

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS coins(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER,
      available_time INTEGER
    );
  `);
  try {
    await db.execAsync(`ALTER TABLE coins ADD COLUMN available_time INTEGER;`);
  } catch (e) {}

  await db.runAsync(
    "INSERT OR IGNORE INTO coins(id, amount, available_time) VALUES (1, 0, 0)"
  );

}
