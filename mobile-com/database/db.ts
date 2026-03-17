import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("focus.db");

export async function initDB() {

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS timer_records(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      duration INTEGER,
      created_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS coins(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER
    );
  `);

}