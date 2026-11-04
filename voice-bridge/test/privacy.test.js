const test = require("node:test");
const assert = require("node:assert");

const { logCallContent, maskPhone, redactPhones } = require("../src/privacy");
const { sendQuoteSms } = require("../src/quoteConfirmation");

function useEnv(t, values) {
  const saved = { ...process.env };
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  t.after(() => {
    process.env = saved;
  });
}

// Records everything written through console.log/warn/error.
function captureConsole(t) {
  const lines = [];
  for (const level of ["log", "warn", "error"]) {
    t.mock.method(console, level, (...args) => lines.push(args.join(" ")));
  }
  return lines;
}

test("phone numbers are masked to their first four and last two digits", () => {
  assert.strictEqual(maskPhone("+27821234567"), "+2782*****67");
  assert.strictEqual(maskPhone("0821234567"), "0821****67");
  assert.strictEqual(maskPhone("123"), "***");
  assert.strictEqual(maskPhone(undefined), "");
});

test("numbers inside free text are masked", () => {
  assert.strictEqual(
    redactPhones("SMSPortal rejected 27821234567: invalid"),
    "SMSPortal rejected 2782*****67: invalid"
  );
  assert.strictEqual(redactPhones("Twilio returned 400"), "Twilio returned 400");
});

test("LOG_CALL_CONTENT works in development and is ignored in production", (t) => {
  useEnv(t, { ENVIRONMENT: "development", LOG_CALL_CONTENT: "true" });
  assert.strictEqual(logCallContent(), true);

  process.env.ENVIRONMENT = "production";
  assert.strictEqual(logCallContent(), false);

  process.env.ENVIRONMENT = "development";
  delete process.env.LOG_CALL_CONTENT;
  assert.strictEqual(logCallContent(), false);
});

test("a failed quote SMS logs a masked number, not the caller's", async (t) => {
  useEnv(t, { SERVICE_API_KEY: undefined });
  const lines = captureConsole(t);

  const result = await sendQuoteSms(
    {
      from: "+27821234567",
      factors: { caller_name: "James" },
      quote: { estimated_quote: 3370, status: "success" }
    },
    async (to) => {
      throw new Error(`SMSPortal rejected ${to.replace(/^\+/, "")}: blocked`);
    }
  );

  assert.strictEqual(result, null);
  const output = lines.join("\n");
  assert.match(output, /Failed to send quote SMS: SMSPortal rejected 2782\*{5}67/);
  assert.doesNotMatch(output, /821234567/);
  assert.doesNotMatch(output, /James/);
});
