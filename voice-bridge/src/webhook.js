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

  // Only override the voice if explicitly set - an unsupported
  // ttsProvider/voice combination makes Twilio reject the TwiML outright
  // (ConversationRelay never even connects), so omit both by default and
  // let Twilio use its own default voice. Voice IDs here are bare - no
  // "Polly." prefix (that's only for <Say>); confirmed from Twilio's own
  // ConversationRelay docs example: ttsProvider="amazon" voice="Elin-Neural".
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

