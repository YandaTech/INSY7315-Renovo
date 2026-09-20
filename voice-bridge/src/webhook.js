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

  // ConversationRelay does STT/TTS for us; websocket.js only ever sees text.
  const relayUrl =
    process.env.CONVERSATION_RELAY_WS_URL ||
    `wss://${req.headers.host}/`;

  // Unset TTS_PROVIDER/TTS_VOICE falls back to Twilio's default voice - a
  // bad combination makes Twilio reject the TwiML outright. Voice IDs are
  // bare, no "Polly." prefix (that's only for <Say>).
  const ttsProvider = process.env.TTS_PROVIDER;
  const ttsVoice = process.env.TTS_VOICE;
  const voiceAttrs =
    ttsProvider && ttsVoice
      ? `\n          ttsProvider="${ttsProvider}"\n          voice="${ttsVoice}"`
      : "";

  const twiml = `
    <Response>
      <Pause length="1" />
      <Connect>
        <ConversationRelay
          url="${relayUrl}"
          welcomeGreeting="Welcome to Renovo. What renovation job can we help you with today?"${voiceAttrs}
        />
      </Connect>
    </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

module.exports = router;

