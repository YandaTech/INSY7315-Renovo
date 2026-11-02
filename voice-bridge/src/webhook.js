const express = require("express");
const { createCall } = require("./callState");
const { WELCOME_GREETING } = require("./greeting");
const { requireTwilioSignature } = require("./twilioSignature");

const router = express.Router();

// Words the caller is likely to say, so speech-to-text doesn't hear
// "bath" as "a bus" or "sink" as "sync". Override with STT_HINTS.
const DEFAULT_HINTS = [
  "bath", "sink", "basin", "re-enamel", "re-enameling", "resurfacing",
  "respray", "cupboard", "kitchen cupboards", "tiles", "shower tray",
  "vanity", "counter-top", "toilet", "sanitaryware", "acrylic", "enamel",
  "cast iron", "steel", "fibreglass", "porcelain", "ceramic", "composite",
  "chips", "cracks", "stained", "peeling", "Rondebosch", "Claremont",
  "Newlands", "Bellville", "Durbanville", "Parow", "Constantia", "Tokai",
  "Wynberg", "Muizenberg", "Sea Point", "Camps Bay", "Hout Bay",
  "Somerset West", "Strand", "Paarl", "Stellenbosch"
].join(",");

function xmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

router.post("/voice", requireTwilioSignature, (req, res) => {
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
  const attrs = {
    url: relayUrl,
    welcomeGreeting: WELCOME_GREETING,
    hints: process.env.STT_HINTS ?? DEFAULT_HINTS,
    // Optional speech-to-text tuning; unset leaves Twilio's defaults, and
    // an invalid value makes Twilio reject the call, so test before setting.
    language: process.env.STT_LANGUAGE,
    transcriptionProvider: process.env.STT_PROVIDER,
    speechModel: process.env.STT_MODEL
  };
  if (ttsProvider && ttsVoice) {
    attrs.ttsProvider = ttsProvider;
    attrs.voice = ttsVoice;
  }
  const relayAttrs = Object.entries(attrs)
    .filter(([, value]) => value)
    .map(([name, value]) => `\n          ${name}="${xmlAttr(value)}"`)
    .join("");

  const twiml = `
    <Response>
      <Pause length="1" />
      <Connect>
        <ConversationRelay${relayAttrs}
        />
      </Connect>
    </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

module.exports = router;

