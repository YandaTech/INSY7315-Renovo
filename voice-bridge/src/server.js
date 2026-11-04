// voice-bridge/.env first, then the repo-root .env shared by every service.
require("dotenv").config({ path: [".env", "../.env"] });

const http = require("http");

const { createApp } = require("./app");
const setupWebSocketServer = require("./websocket");
const { assertSecureConfig } = require("./twilioSignature");

// Production fails closed: no Twilio auth token, no server.
try {
  assertSecureConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = createApp();

const PORT = process.env.PORT || 5000;

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Attach the WebSocket server to the same HTTP server
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Voice Bridge running on http://localhost:${PORT}`);
});

