const router = require("express").Router();
const db = require("../db");

// 获取任务
router.get("/", (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    res.json(rows);
  });
});

// 创建任务
router.post("/", (req, res) => {
  const { name } = req.body;

  db.run(
    "INSERT INTO tasks(name) VALUES(?)",
    [name],
    function () {
      res.json({
        id: this.lastID,
        name
      });
    }
  );
});

module.exports = router;