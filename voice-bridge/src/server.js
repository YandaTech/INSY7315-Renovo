require("dotenv").config();

const express = require("express");
const http = require("http");

const voiceWebhook = require("./webhook");
const setupWebSocketServer = require("./websocket");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Renovo Voice Bridge is running");
});

app.use("/", voiceWebhook);

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Attach the WebSocket server to the same HTTP server
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Voice Bridge running on http://localhost:${PORT}`);
});

