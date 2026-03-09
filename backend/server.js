const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("E-learning system running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});