const express = require("express");

const voiceWebhook = require("./webhook");

// The Express app, without the HTTP server or the WebSocket, so tests can
// run it on a spare port.
function createApp() {
  const app = express();

  // Express announces itself with "X-Powered-By: Express" by default.
  // That only helps someone looking for Express-specific bugs.
  app.disable("x-powered-by");

  // Behind Caddy: trust X-Forwarded-Proto so req.protocol is https, which
  // the Twilio signature check needs to rebuild the URL Twilio called.
  app.set("trust proxy", true);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Renovo Voice Bridge is running");
  });

  app.use("/", voiceWebhook);

  return app;
}

module.exports = { createApp };
