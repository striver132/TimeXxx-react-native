const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/tasks", require("./routes/tasks"));
// app.use("/timer", require("./routes/timer"));
// app.use("/coins", require("./routes/coins"));
// app.use("/shop", require("./routes/shop"));

app.listen(3000, () => {
  console.log("Server running: http://localhost:3000");
});