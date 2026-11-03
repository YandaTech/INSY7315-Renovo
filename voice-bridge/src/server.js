// voice-bridge/.env first, then the repo-root .env shared by every service.
require("dotenv").config({ path: [".env", "../.env"] });

const express = require("express");
const http = require("http");

const voiceWebhook = require("./webhook");
const setupWebSocketServer = require("./websocket");
const { assertSecureConfig } = require("./twilioSignature");

// Production fails closed: no Twilio auth token, no server.
try {
  assertSecureConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = express();

// Behind Caddy: trust X-Forwarded-Proto so req.protocol is https, which
// the Twilio signature check needs to rebuild the URL Twilio called.
app.set("trust proxy", true);

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

