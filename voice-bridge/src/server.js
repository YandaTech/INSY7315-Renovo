require("dotenv").config();

const express = require("express");
const voiceWebhook = require("./webhook");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Renovo Voice Bridge is running");
});

app.use("/", voiceWebhook);

app.listen(PORT, () => {
  console.log(`Voice Bridge running on http://localhost:${PORT}`);
});