const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const WebSocket = require("ws");

// Fake backend + agent on one server, recording what voice-bridge sends.
function startFakeServices({
  quote = { estimated_quote: 3370 },
  factors = { job_type: "bath_reenamel", caller_name: "James" }
} = {}) {
  const seen = { calls: [], leads: [], ended: [], notifications: [] };
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
      if (url.pathname === "/notifications/") {
        seen.notifications.push({ query: url.search, ...JSON.parse(body) });
        return res.end(JSON.stringify({ id: 1 }));
      }
      if (url.pathname === "/agent/stream") {
        res.setHeader("Content-Type", "application/x-ndjson");
        const events = [
          { type: "text", text: "That's about " },
          { type: "text", text: "R3,370." },
          {
            type: "done",
            factors,
            quote,
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

test("a call the agent couldn't price saves its lead with no quote, not R0", async () => {
  const fake = startFakeServices({ quote: null });
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
  socket.send(JSON.stringify({ type: "setup", callSid: "CA-unpriced", from: "+27820000002" }));
  const reply = new Promise((resolve) =>
    socket.on("message", (raw) => {
      if (JSON.parse(raw.toString()).last) resolve();
    })
  );
  socket.send(JSON.stringify({ type: "prompt", voicePrompt: "My bath is stained" }));
  await reply;

  socket.close();
  await new Promise((resolve) => setTimeout(resolve, 300));

  assert.strictEqual(fake.seen.calls[0].outcome, "incomplete");
  assert.strictEqual(fake.seen.leads.length, 1);
  assert.strictEqual(fake.seen.leads[0].quote, null);
  assert.strictEqual(fake.seen.leads[0].status, "incomplete");

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

test("production logs carry call SIDs and lengths, not what was said", async (t) => {
  const fake = startFakeServices();
  const saved = { ...process.env };
  Object.assign(process.env, {
    ENVIRONMENT: "production",
    // Ignored in production, so the conversation must still stay out
    LOG_CALL_CONTENT: "true",
    BACKEND_API_URL: fake.url,
    AI_AGENT_URL: fake.url
  });
  t.after(() => {
    process.env = saved;
  });

  const lines = [];
  for (const level of ["log", "warn", "error"]) {
    t.mock.method(console, level, (...args) => lines.push(args.join(" ")));
  }

  // In production only calls announced by the /voice webhook may stream.
  require("../src/callState").createCall("CA-private", { from: "+27821234567" });

  const setupWebSocketServer = require("../src/websocket");
  const bridge = http.createServer();
  setupWebSocketServer(bridge);
  bridge.listen(0);

  try {
    const socket = new WebSocket(`ws://127.0.0.1:${bridge.address().port}`);
    await new Promise((resolve) => socket.on("open", resolve));
    socket.send(
      JSON.stringify({ type: "setup", callSid: "CA-private", from: "+27821234567" })
    );
    const reply = new Promise((resolve) =>
      socket.on("message", (raw) => {
        if (JSON.parse(raw.toString()).last) resolve();
      })
    );
    socket.send(
      JSON.stringify({ type: "prompt", voicePrompt: "My bath at 12 Oak Road is stained" })
    );
    await reply;
    socket.close();
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    bridge.close();
    fake.server.close();
  }

  const output = lines.join("\n");
  assert.match(output, /Caller spoke on CA-private: 33 chars/);
  assert.match(output, /Agent replied on CA-private: 20 chars, quote status ok/);
  assert.match(output, /Call ended: CA-private/);
  for (const secret of ["Oak Road", "stained", "R3,370", "3370", "James", "821234567"]) {
    assert.ok(!output.includes(secret), `log leaked ${secret}:\n${output}`);
  }
  // The call is still saved in full; only the logs leave the content out.
  assert.strictEqual(fake.seen.calls.length, 1);
  assert.match(fake.seen.calls[0].transcript, /Oak Road/);
});

test("a quoted call with an email sends one quote email and logs it", async (t) => {
  const fake = startFakeServices({
    factors: {
      job_type: "bath_reenamel",
      caller_name: "James",
      email: "james@example.com"
    }
  });
  const saved = { ...process.env };
  Object.assign(process.env, {
    BACKEND_API_URL: fake.url,
    AI_AGENT_URL: fake.url,
    ALLOW_UNVERIFIED_CALLS: "true",
    SERVICE_API_KEY: "svc",
    EMAIL_PROVIDER: "ses",
    EMAIL_FROM: "quotes@renovo.test"
  });
  t.after(() => {
    process.env = saved;
  });
  t.mock.method(console, "error", () => {});

  const sent = [];
  const { setSesClient } = require("../src/notifications");
  setSesClient({
    send: async (command) => {
      sent.push(command.input);
      return { MessageId: "ses-1" };
    }
  });
  t.after(() => setSesClient(null));

  const setupWebSocketServer = require("../src/websocket");
  const bridge = http.createServer();
  setupWebSocketServer(bridge);
  bridge.listen(0);

  try {
    const socket = new WebSocket(`ws://127.0.0.1:${bridge.address().port}`);
    await new Promise((resolve) => socket.on("open", resolve));
    socket.send(JSON.stringify({ type: "setup", callSid: "CA-email", from: "client:demo" }));
    const reply = new Promise((resolve) =>
      socket.on("message", (raw) => {
        if (JSON.parse(raw.toString()).last) resolve();
      })
    );
    socket.send(JSON.stringify({ type: "prompt", voicePrompt: "My bath is stained" }));
    await reply;
    // The simulator's "end" and the socket closing both finish the call.
    socket.send(JSON.stringify({ type: "end" }));
    socket.close();
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    bridge.close();
    fake.server.close();
  }

  assert.strictEqual(sent.length, 1);
  assert.deepStrictEqual(sent[0].Destination.ToAddresses, ["james@example.com"]);
  assert.match(sent[0].Content.Simple.Body.Text.Data, /R3,370/);

  const emails = fake.seen.notifications.filter((n) => n.type === "email");
  assert.strictEqual(emails.length, 1);
  assert.strictEqual(emails[0].status, "sent");
  assert.strictEqual(emails[0].provider_id, "ses-1");
  assert.strictEqual(emails[0].query, "");
  // The email stays out of the lead's job details.
  assert.strictEqual(fake.seen.leads.length, 1);
  assert.ok(!("email" in fake.seen.leads[0].job_details));
});
