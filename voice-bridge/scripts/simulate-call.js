// Simulates a Twilio ConversationRelay call against a running voice-bridge,
// so the whole pipeline (voice-bridge -> ai-agent -> pricing server ->
// backend) can be tested without a phone or a Twilio number.
//
//   npm run simulate-call                      # scripted caller
//   npm run simulate-call -- --interactive     # type the caller's lines
//
// Needs backend, mcp-pricing-server, ai-agent and voice-bridge running, with
// ALLOW_UNVERIFIED_CALLS=true on voice-bridge (docker-compose.yml sets it).
// The final hang-up will log a Twilio error because the call SID is fake.

const readline = require("readline");
const WebSocket = require("ws");

const BRIDGE_URL =
  process.env.VOICE_BRIDGE_WS_URL ||
  `ws://localhost:${process.env.PORT || 5000}`;

const SCRIPTED_CALLER = [
  "Hi, my name is Thandi.",
  "I'd like my bath re-enameled, it's looking really tired.",
  "Just the one bath.",
  "It's an old heavy one, enamel I think.",
  "It's quite dull and stained, no cracks though.",
  "I'm in Rondebosch.",
  "No thanks, that's all I needed. Bye!"
];

const callSid = `CA-sim-${Date.now()}`;
const interactive = process.argv.includes("--interactive");

const socket = new WebSocket(BRIDGE_URL);
let pendingReply = null;
let replyText = "";

function say(text) {
  console.log(`\nCaller: ${text}`);
  socket.send(JSON.stringify({ type: "prompt", voicePrompt: text, last: true }));
  return new Promise((resolve) => {
    pendingReply = resolve;
  });
}

socket.on("message", (message) => {
  const data = JSON.parse(message.toString());

  // Replies stream in as several text messages; last:true ends the reply.
  if (data.type === "text") {
    replyText += data.token;
    if (data.last) {
      console.log(`Agent:  ${replyText.trim()}`);
      replyText = "";
      if (pendingReply) {
        pendingReply();
        pendingReply = null;
      }
    }
  }
});

socket.on("error", (error) => {
  console.error(`Could not reach voice-bridge at ${BRIDGE_URL}:`, error.message);
  process.exit(1);
});

socket.on("open", async () => {
  console.log(`Connected to ${BRIDGE_URL} as ${callSid}`);

  socket.send(
    JSON.stringify({
      type: "setup",
      callSid,
      from: "+27820000001",
      to: "+27210000000"
    })
  );

  if (interactive) {
    const rl = readline.createInterface({ input: process.stdin });
    console.log("Type the caller's lines. Empty line ends the call.");
    for await (const line of rl) {
      if (!line.trim()) break;
      await say(line.trim());
    }
    rl.close();
  } else {
    for (const line of SCRIPTED_CALLER) {
      await say(line);
    }
  }

  socket.send(JSON.stringify({ type: "end" }));
  console.log("\nCall ended. Check GET /calls/ and GET /leads/ on the backend.");

  // Give voice-bridge time to save the call and lead before disconnecting.
  setTimeout(() => socket.close(), 1500);
});
