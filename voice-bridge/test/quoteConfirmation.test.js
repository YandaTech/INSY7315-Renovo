const test = require("node:test");
const assert = require("node:assert");

const { sendQuoteSms, buildQuoteMessage } = require("../src/quoteConfirmation");

const quotedCall = {
  from: "+27820000001",
  factors: { caller_name: "James", job_type: "bath_reenamel" },
  quote: { estimated_quote: 3370, currency: "ZAR", status: "success" }
};

// Stands in for Twilio and the backend's /notifications/ log.
function mockFetch(t, { twilioOk = true } = {}) {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).includes("api.twilio.com")) {
      return new Response(
        JSON.stringify(twilioOk ? { sid: "SM123" } : { message: "Invalid 'To' number" }),
        { status: twilioOk ? 201 : 400 }
      );
    }
    return new Response(JSON.stringify({ id: 1 }), { status: 200 });
  });
  return requests;
}

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

const twilioEnv = {
  TWILIO_ACCOUNT_SID: "AC123",
  TWILIO_AUTH_TOKEN: "secret",
  TWILIO_MESSAGING_SERVICE_SID: undefined,
  TWILIO_FROM_NUMBER: "+27210000000",
  SERVICE_API_KEY: "svc",
  BACKEND_API_URL: "http://backend.test"
};

test("the message names the caller, the job and the quote in rand", () => {
  assert.strictEqual(
    buildQuoteMessage(quotedCall),
    "Hi James, thanks for calling Renovo Cape. Your estimated quote for your " +
      "bath reenamel is R3,370. Our team will be in touch to confirm the details."
  );
});

test("a quoted call texts the caller from TWILIO_FROM_NUMBER and logs it", async (t) => {
  useEnv(t, twilioEnv);
  const requests = mockFetch(t);

  const result = await sendQuoteSms(quotedCall);

  assert.strictEqual(result.providerId, "SM123");
  const twilio = requests.find((r) => r.url.includes("api.twilio.com"));
  assert.match(twilio.url, /Accounts\/AC123\/Messages\.json$/);
  const body = new URLSearchParams(twilio.options.body);
  assert.strictEqual(body.get("To"), "+27820000001");
  assert.strictEqual(body.get("From"), "+27210000000");
  assert.match(body.get("Body"), /R3,370/);

  const log = requests.find((r) => r.url.startsWith("http://backend.test/notifications/"));
  const params = new URL(log.url).searchParams;
  assert.strictEqual(params.get("type"), "sms");
  assert.strictEqual(params.get("status"), "sent");
  assert.strictEqual(params.get("provider_id"), "SM123");
});

test("a Messaging Service is used instead of the number when it is set", async (t) => {
  useEnv(t, { ...twilioEnv, TWILIO_MESSAGING_SERVICE_SID: "MG123" });
  const requests = mockFetch(t);

  await sendQuoteSms(quotedCall);

  const body = new URLSearchParams(requests[0].options.body);
  assert.strictEqual(body.get("MessagingServiceSid"), "MG123");
  assert.strictEqual(body.get("From"), null);
});

test("calls without a usable quote or phone number send nothing", async (t) => {
  useEnv(t, twilioEnv);
  const requests = mockFetch(t);

  const skipped = [
    { ...quotedCall, quote: null },
    { ...quotedCall, quote: { estimated_quote: 0, status: "error" } },
    { ...quotedCall, from: "client:demo-browser" },
    { ...quotedCall, from: undefined }
  ];
  for (const call of skipped) {
    assert.strictEqual(await sendQuoteSms(call), null);
  }
  assert.strictEqual(requests.length, 0);
});

test("a Twilio failure is logged as failed and does not throw", async (t) => {
  useEnv(t, twilioEnv);
  const requests = mockFetch(t, { twilioOk: false });
  t.mock.method(console, "error", () => {});

  assert.strictEqual(await sendQuoteSms(quotedCall), null);

  const log = requests.find((r) => r.url.startsWith("http://backend.test/notifications/"));
  assert.strictEqual(new URL(log.url).searchParams.get("status"), "failed");
});
