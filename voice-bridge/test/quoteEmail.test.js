const test = require("node:test");
const assert = require("node:assert");

const { SendEmailCommand } = require("@aws-sdk/client-sesv2");
const {
  sendQuoteEmail,
  buildQuoteEmail,
  toEmailAddress,
  emailFor,
  QUOTE_EMAIL_SUBJECT
} = require("../src/quoteConfirmation");
const { setSesClient } = require("../src/notifications");
const { maskEmail, redactEmails } = require("../src/privacy");

const quotedCall = {
  from: "+27820000001",
  factors: {
    caller_name: "James",
    job_type: "bath_reenamel",
    email: "james.smith@example.com"
  },
  quote: { estimated_quote: 3370, currency: "ZAR", status: "ok" }
};

function useEnv(t, values) {
  const saved = {};
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

// Stands in for the backend's /notifications/ log.
function mockBackend(t) {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    requests.push({ url: String(url), options });
    return new Response(JSON.stringify({ id: 1 }), { status: 200 });
  });
  return requests;
}

// Stands in for the SES client; `reply` is a MessageId or an Error.
function mockSes(t, reply) {
  const commands = [];
  setSesClient({
    send: async (command) => {
      commands.push(command);
      if (reply instanceof Error) throw reply;
      return { MessageId: reply };
    }
  });
  t.after(() => setSesClient(null));
  return commands;
}

// Records everything written through console.log/warn/error.
function captureConsole(t) {
  const lines = [];
  for (const level of ["log", "warn", "error"]) {
    t.mock.method(console, level, (...args) => lines.push(args.join(" ")));
  }
  return lines;
}

// The notification log as the backend receives it: in the JSON body,
// never in the URL.
function logBody(request) {
  assert.strictEqual(request.url, "http://backend.test/notifications/");
  return JSON.parse(request.options.body);
}

const sesEnv = {
  EMAIL_PROVIDER: "ses",
  EMAIL_FROM: "quotes@renovo.test",
  AWS_REGION: "eu-north-1",
  SERVICE_API_KEY: "svc",
  BACKEND_API_URL: "http://backend.test"
};

test("a quoted call with an email sends exactly one SES email with the quote", async (t) => {
  useEnv(t, sesEnv);
  const requests = mockBackend(t);
  const commands = mockSes(t, "ses-msg-1");
  captureConsole(t);

  const result = await sendQuoteEmail(quotedCall);

  assert.strictEqual(result.providerId, "ses-msg-1");
  assert.strictEqual(commands.length, 1);
  assert.ok(commands[0] instanceof SendEmailCommand);
  const input = commands[0].input;
  assert.strictEqual(input.FromEmailAddress, "quotes@renovo.test");
  assert.deepStrictEqual(input.Destination, { ToAddresses: ["james.smith@example.com"] });
  assert.strictEqual(input.Content.Simple.Subject.Data, QUOTE_EMAIL_SUBJECT);
  assert.match(input.Content.Simple.Body.Text.Data, /R3,370/);
  assert.match(input.Content.Simple.Body.Text.Data, /bath reenamel/);

  assert.strictEqual(requests.length, 1);
  const logged = logBody(requests[0]);
  assert.strictEqual(logged.type, "email");
  assert.strictEqual(logged.recipient, "james.smith@example.com");
  assert.strictEqual(logged.subject, QUOTE_EMAIL_SUBJECT);
  assert.match(logged.message, /R3,370/);
  assert.strictEqual(logged.status, "sent");
  assert.strictEqual(logged.provider_id, "ses-msg-1");
});

test("no email, an unusable email or no quote sends nothing", async (t) => {
  useEnv(t, sesEnv);
  const requests = mockBackend(t);
  const commands = mockSes(t, "ses-msg-2");

  const skipped = [
    { ...quotedCall, factors: { caller_name: "James", job_type: "bath_reenamel" } },
    { ...quotedCall, factors: { ...quotedCall.factors, email: "james at gmail" } },
    { ...quotedCall, quote: null },
    { ...quotedCall, quote: { estimated_quote: 0, status: "error" } }
  ];
  for (const call of skipped) {
    assert.strictEqual(await sendQuoteEmail(call), null);
  }
  assert.strictEqual(commands.length, 0);
  assert.strictEqual(requests.length, 0);
});

test("with no EMAIL_PROVIDER nothing is sent, and the log leaves the address out", async (t) => {
  useEnv(t, { ...sesEnv, EMAIL_PROVIDER: undefined });
  const requests = mockBackend(t);
  const commands = mockSes(t, "ses-msg-3");
  const lines = captureConsole(t);

  assert.strictEqual(await sendQuoteEmail(quotedCall), null);

  assert.strictEqual(commands.length, 0);
  assert.strictEqual(requests.length, 0);
  const output = lines.join("\n");
  assert.match(output, /Quote email skipped: EMAIL_PROVIDER is not set/);
  assert.doesNotMatch(output, /james/i);
});

test("an SES failure is logged as a failed notification, masked, and does not throw", async (t) => {
  useEnv(t, sesEnv);
  const requests = mockBackend(t);
  mockSes(
    t,
    new Error("Email address is not verified: james.smith@example.com, +27821234567")
  );
  const lines = captureConsole(t);

  assert.strictEqual(await sendQuoteEmail(quotedCall), null);

  assert.strictEqual(requests.length, 1);
  const logged = logBody(requests[0]);
  assert.strictEqual(logged.type, "email");
  assert.strictEqual(logged.status, "failed");
  assert.strictEqual(logged.provider_id, undefined);

  const output = lines.join("\n");
  assert.match(output, /Failed to send quote email: .*j\*\*\*@e\*\*\*\.com/);
  assert.doesNotMatch(output, /james\.smith/);
  assert.doesNotMatch(output, /821234567/);
});

test("a missing EMAIL_FROM is a failed send, not a crash", async (t) => {
  useEnv(t, { ...sesEnv, EMAIL_FROM: undefined });
  const requests = mockBackend(t);
  const commands = mockSes(t, "ses-msg-4");
  captureConsole(t);

  assert.strictEqual(await sendQuoteEmail(quotedCall), null);
  assert.strictEqual(commands.length, 0);
  assert.strictEqual(logBody(requests[0]).status, "failed");
});

test("spoken email addresses are tidied up, and junk is rejected", () => {
  assert.strictEqual(toEmailAddress("James.Smith@Example.com "), "james.smith@example.com");
  assert.strictEqual(
    toEmailAddress("james dot smith at gmail dot com"),
    "james.smith@gmail.com"
  );
  assert.strictEqual(toEmailAddress("j underscore smith at mail dot co dot za"), "j_smith@mail.co.za");
  assert.strictEqual(toEmailAddress("james at gmail"), null);
  assert.strictEqual(toEmailAddress("not an email"), null);
  assert.strictEqual(toEmailAddress(undefined), null);
  assert.strictEqual(emailFor({ factors: {} }), null);
});

test("the email repeats the SMS text and says the price is an estimate", () => {
  const body = buildQuoteEmail(quotedCall);
  assert.match(body, /^Hi James, thanks for calling Renovo Cape\./);
  assert.match(body, /estimate/);
});

test("email addresses are masked in logs", () => {
  assert.strictEqual(maskEmail("james.smith@gmail.com"), "j***@g***.com");
  assert.strictEqual(maskEmail("nope"), "****");
  assert.strictEqual(
    redactEmails("SES rejected james@example.co.za today"),
    "SES rejected j***@e***.za today"
  );
  assert.strictEqual(redactEmails("SES returned 400"), "SES returned 400");
});
