const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const express = require("express");

const {
  computeSignature,
  isValidSignature,
  assertSecureConfig,
  allowUnverifiedCalls
} = require("../src/twilioSignature");

const TOKEN = "test-auth-token";
const PARAMS = { CallSid: "CA123", From: "+27820000001", To: "+27210000000" };

test("accepts a signature over the same URL and params", () => {
  const url = "https://voice.example.com/voice";
  const sig = computeSignature(TOKEN, url, PARAMS);
  assert.ok(isValidSignature(TOKEN, sig, url, PARAMS));
});

test("param order doesn't matter, values and URL do", () => {
  const url = "https://voice.example.com/voice";
  const sig = computeSignature(TOKEN, url, PARAMS);
  const reordered = { To: PARAMS.To, CallSid: PARAMS.CallSid, From: PARAMS.From };

  assert.ok(isValidSignature(TOKEN, sig, url, reordered));
  assert.ok(!isValidSignature(TOKEN, sig, url, { ...PARAMS, From: "+1555" }));
  assert.ok(!isValidSignature(TOKEN, sig, "https://evil.example.com/voice", PARAMS));
  assert.ok(!isValidSignature("other-token", sig, url, PARAMS));
  assert.ok(!isValidSignature(TOKEN, undefined, url, PARAMS));
});

async function withWebhookServer(env, fn) {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  delete require.cache[require.resolve("../src/webhook")];

  const app = express();
  app.set("trust proxy", true);
  app.use(express.urlencoded({ extended: false }));
  app.use("/", require("../src/webhook"));

  const server = http.createServer(app).listen(0);
  const { port } = server.address();
  try {
    await fn(port);
  } finally {
    server.close();
    process.env = saved;
  }
}

function postVoice(port, headers = {}) {
  return fetch(`http://127.0.0.1:${port}/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    body: new URLSearchParams(PARAMS).toString()
  });
}

test("webhook rejects unsigned requests and accepts Twilio-signed ones", async () => {
  await withWebhookServer(
    { TWILIO_AUTH_TOKEN: TOKEN, PUBLIC_VOICE_URL: "https://voice.example.com" },
    async (port) => {
      assert.strictEqual((await postVoice(port)).status, 403);

      const sig = computeSignature(TOKEN, "https://voice.example.com/voice", PARAMS);
      const ok = await postVoice(port, { "X-Twilio-Signature": sig });
      assert.strictEqual(ok.status, 200);
      const twiml = await ok.text();
      assert.match(twiml, /<ConversationRelay/);
      assert.match(twiml, /hints="[^"]*shower tray[^"]*"/);
    }
  );
});

test("webhook rebuilds the public URL from proxy headers", async () => {
  await withWebhookServer({ TWILIO_AUTH_TOKEN: TOKEN }, async (port) => {
    const sig = computeSignature(TOKEN, "https://voice.example.com/voice", PARAMS);
    // fetch can't override Host, so use http.request like Caddy's proxy would
    const status = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          port,
          path: "/voice",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Twilio-Signature": sig,
            "X-Forwarded-Proto": "https",
            Host: "voice.example.com"
          }
        },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        }
      );
      req.on("error", reject);
      req.end(new URLSearchParams(PARAMS).toString());
    });
    assert.strictEqual(status, 200);
  });
});

test("validation is skipped without an auth token (local dev)", async () => {
  await withWebhookServer({ TWILIO_AUTH_TOKEN: "", ENVIRONMENT: "" }, async (port) => {
    assert.strictEqual((await postVoice(port)).status, 200);
  });
});

test("production rejects webhooks when the auth token is missing", async () => {
  await withWebhookServer({ ENVIRONMENT: "production", TWILIO_AUTH_TOKEN: "" }, async (port) => {
    assert.strictEqual((await postVoice(port)).status, 403);
  });
});

test("production ignores VALIDATE_TWILIO_SIGNATURE=false", async () => {
  await withWebhookServer(
    {
      ENVIRONMENT: "production",
      TWILIO_AUTH_TOKEN: TOKEN,
      VALIDATE_TWILIO_SIGNATURE: "false",
      PUBLIC_VOICE_URL: "https://voice.example.com"
    },
    async (port) => {
      assert.strictEqual((await postVoice(port)).status, 403);

      const sig = computeSignature(TOKEN, "https://voice.example.com/voice", PARAMS);
      assert.strictEqual((await postVoice(port, { "X-Twilio-Signature": sig })).status, 200);
    }
  );
});

test("assertSecureConfig and ALLOW_UNVERIFIED_CALLS fail closed only in production", () => {
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { TWILIO_AUTH_TOKEN: "", ALLOW_UNVERIFIED_CALLS: "true" });

    process.env.ENVIRONMENT = "development";
    assert.doesNotThrow(assertSecureConfig);
    assert.strictEqual(allowUnverifiedCalls(), true);

    process.env.ENVIRONMENT = "production";
    assert.throws(assertSecureConfig, /TWILIO_AUTH_TOKEN/);
    assert.strictEqual(allowUnverifiedCalls(), false);

    process.env.TWILIO_AUTH_TOKEN = TOKEN;
    assert.doesNotThrow(assertSecureConfig);
  } finally {
    process.env = saved;
  }
});

test("server refuses to start in production without an auth token", () => {
  // Run from an empty directory so no .env file is picked up.
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "voice-bridge-"));
  const result = spawnSync(process.execPath, [path.join(__dirname, "../src/server.js")], {
    cwd,
    env: { ...process.env, ENVIRONMENT: "production", TWILIO_AUTH_TOKEN: "", PORT: "0" },
    encoding: "utf8",
    timeout: 10000
  });
  fs.rmSync(cwd, { recursive: true, force: true });

  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /Refusing to start in production: TWILIO_AUTH_TOKEN/);
});
