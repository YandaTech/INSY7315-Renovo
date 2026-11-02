const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const WebSocket = require("ws");

// Fake backend + agent on one server, recording what voice-bridge sends.
function startFakeServices() {
  const seen = { calls: [], leads: [], ended: [] };
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const url = new URL(req.url, "http://x");
      res.setHeader("Content-Type", "application/json");
      if (url.pathname === "/calls/") {
        seen.calls.push({ query: url.search, ...JSON.parse(body) });
        return res.end(JSON.stringify({ id: 1 }));
      }
      if (url.pathname === "/leads/") {
        seen.leads.push({ query: url.search, ...JSON.parse(body) });
        return res.end(JSON.stringify({ lead_id: 1 }));
      }
      if (url.pathname === "/agent/stream") {
        res.setHeader("Content-Type", "application/x-ndjson");
        const events = [
          { type: "text", text: "That's about " },
          { type: "text", text: "R3,370." },
          {
            type: "done",
            factors: { job_type: "bath_reenamel", caller_name: "James" },
            quote: { estimated_quote: 3370 },
            end_call: false
          }
        ];
        return res.end(events.map((e) => JSON.stringify(e)).join("\n") + "\n");
      }
      if (url.pathname.startsWith("/agent/end/")) {
        seen.ended.push(url.pathname);
        return res.end("{}");
      }
      res.statusCode = 404;
      res.end("{}");
    });
  });
  server.listen(0);
  return { server, seen, url: `http://127.0.0.1:${server.address().port}` };
}

test("a real Twilio call (socket closes, no 'end' message) is saved once", async () => {
  const fake = startFakeServices();
  Object.assign(process.env, {
    BACKEND_API_URL: fake.url,
    AI_AGENT_URL: fake.url,
    ALLOW_UNVERIFIED_CALLS: "true"
  });

  const setupWebSocketServer = require("../src/websocket");
  const bridge = http.createServer();
  setupWebSocketServer(bridge);
  bridge.listen(0);

  const socket = new WebSocket(`ws://127.0.0.1:${bridge.address().port}`);
  await new Promise((resolve) => socket.on("open", resolve));

  socket.send(JSON.stringify({ type: "setup", callSid: "CA-real", from: "+27820000001" }));
  // Collect the streamed reply until ConversationRelay's last:true marker
  const tokens = [];
  const reply = new Promise((resolve) =>
    socket.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      tokens.push(msg);
      if (msg.last) resolve();
    })
  );
  socket.send(JSON.stringify({ type: "prompt", voicePrompt: "My bath is stained" }));
  await reply;

  assert.deepStrictEqual(
    tokens.map((t) => [t.token, t.last]),
    [["That's about ", false], ["R3,370.", false], ["", true]]
  );

  socket.close();
  await new Promise((resolve) => setTimeout(resolve, 300));

  assert.strictEqual(fake.seen.calls.length, 1);
  assert.strictEqual(fake.seen.calls[0].outcome, "quoted");
  assert.match(fake.seen.calls[0].transcript, /Caller: My bath is stained/);
  assert.match(fake.seen.calls[0].transcript, /Agent: That's about R3,370\./);

  assert.strictEqual(fake.seen.leads.length, 1);
  assert.strictEqual(fake.seen.leads[0].name, "James");
  assert.strictEqual(fake.seen.leads[0].quote, 3370);
  assert.strictEqual(fake.seen.leads[0].job_details.job_type, "bath_reenamel");
  // Nothing about the caller goes in the URL
  assert.strictEqual(fake.seen.calls[0].query, "");
  assert.strictEqual(fake.seen.leads[0].query, "");
  assert.deepStrictEqual(fake.seen.ended, ["/agent/end/CA-real"]);

  bridge.close();
  fake.server.close();
});

test("production ignores ALLOW_UNVERIFIED_CALLS and rejects unknown calls", async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { ENVIRONMENT: "production", ALLOW_UNVERIFIED_CALLS: "true" });

  const setupWebSocketServer = require("../src/websocket");
  const bridge = http.createServer();
  setupWebSocketServer(bridge);
  bridge.listen(0);

  try {
    const socket = new WebSocket(`ws://127.0.0.1:${bridge.address().port}`);
    await new Promise((resolve) => socket.on("open", resolve));
    const closed = new Promise((resolve) => socket.on("close", (code) => resolve(code)));
    socket.send(JSON.stringify({ type: "setup", callSid: "CA-made-up" }));
    assert.strictEqual(await closed, 1008);
  } finally {
    bridge.close();
    process.env = saved;
  }
});
