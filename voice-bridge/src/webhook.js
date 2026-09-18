const express = require("express");
const { createCall } = require("./callState");

const router = express.Router();

router.post("/voice", (req, res) => {
  const callSid = req.body.CallSid;

  if (callSid) {
    createCall(callSid, {
      from: req.body.From,
      to: req.body.To
    });

    console.log(`Tracking active call: ${callSid}`);
  }

  // Twilio ConversationRelay handles speech-to-text and text-to-speech for
  // us and talks to our WebSocket server (websocket.js) in plain text.
  // The Claude Haiku conversation loop (ai-agent/) never sees raw audio.
  const relayUrl =
    process.env.CONVERSATION_RELAY_WS_URL ||
    `wss://${req.headers.host}/`;

  const twiml = `
    <Response>
      <Connect>
        <ConversationRelay
          url="${relayUrl}"
          welcomeGreeting="Welcome to Renovo. What renovation job can we help you with today?"
        />
      </Connect>
    </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

module.exports = router;

