const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/focus.db");

db.serialize(() => {

  // 任务表
  db.run(`
  CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )
  `);

  // 计时记录
  db.run(`
  CREATE TABLE IF NOT EXISTS timer_records(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `);

  // 虚拟币
  db.run(`
  CREATE TABLE IF NOT EXISTS coins(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER
  )
  `);

  // 商店
  db.run(`
  CREATE TABLE IF NOT EXISTS shop_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER
  )
  `);

});

module.exports = db;