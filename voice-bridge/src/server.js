require("dotenv").config();

const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Renovo Voice Bridge is running");
});

app.listen(PORT, () => {
  console.log(`Voice Bridge running on http://localhost:${PORT}`);
});