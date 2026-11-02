// Spoken by ConversationRelay when the call connects; websocket.js also
// writes it into the transcript since the agent never sees it.
// It tells callers up front that they are speaking to an AI and that the
// call is transcribed (POPIA section 18 openness). Read aloud by TTS, so
// keep it short and free of symbols or abbreviations.
const WELCOME_GREETING =
  "Thanks for calling Renovo Cape. I'm the AI assistant, and this call is transcribed so our team can follow up. What can we help you restore today?";

module.exports = { WELCOME_GREETING };
