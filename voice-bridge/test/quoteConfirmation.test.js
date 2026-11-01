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
  SMS_PROVIDER: undefined,
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

// SMSPortal stand-in; `reply` is what rest.smsportal.com answers.
function mockSmsPortal(t, reply, status = 200) {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).includes("smsportal")) {
      return new Response(JSON.stringify(reply), { status });
    }
    return new Response(JSON.stringify({ id: 1 }), { status: 200 });
  });
  return requests;
}

const smsPortalEnv = {
  SMS_PROVIDER: "smsportal",
  SMSPORTAL_CLIENT_ID: "client",
  SMSPORTAL_API_SECRET: "secret",
  SMSPORTAL_API_URL: undefined,
  SMSPORTAL_TEST_MODE: "true",
  SERVICE_API_KEY: "svc",
  BACKEND_API_URL: "http://backend.test"
};

test("with SMS_PROVIDER=smsportal the quote goes through SMSPortal", async (t) => {
  useEnv(t, smsPortalEnv);
  const requests = mockSmsPortal(t, {
    statusCode: 200,
    sendResponse: { eventId: 2235442184, errorReport: { faults: [] } },
    errors: []
  });

  const result = await sendQuoteSms(quotedCall);

  assert.strictEqual(result.providerId, "2235442184");
  const portal = requests[0];
  assert.strictEqual(portal.url, "https://rest.smsportal.com/v3/BulkMessages");
  assert.strictEqual(
    portal.options.headers.Authorization,
    `Basic ${Buffer.from("client:secret").toString("base64")}`
  );
  const body = JSON.parse(portal.options.body);
  assert.deepStrictEqual(body.sendOptions, { testMode: true });
  assert.strictEqual(body.messages[0].destination, "27820000001");
  assert.match(body.messages[0].content, /R3,370/);
  assert.ok(!requests.some((r) => r.url.includes("twilio")));

  const log = new URL(requests[1].url).searchParams;
  assert.strictEqual(log.get("status"), "sent");
  assert.strictEqual(log.get("provider_id"), "2235442184");
});

test("SMSPortal's flat reply shape is accepted too", async (t) => {
  useEnv(t, smsPortalEnv);
  mockSmsPortal(t, { eventId: 42, errorReport: { faults: [] } });

  assert.strictEqual((await sendQuoteSms(quotedCall)).providerId, "42");
});

test("an SMSPortal error or rejected number is logged as failed", async (t) => {
  useEnv(t, smsPortalEnv);
  t.mock.method(console, "error", () => {});

  const cases = [
    [{ errors: [{ errorCode: "InsufficientCredits", errorMessage: "No credits" }] }, 403],
    [{ sendResponse: { eventId: 1, errorReport: { faults: [{ errorMessage: "Opted out" }] } } }, 200]
  ];
  for (const [reply, status] of cases) {
    const requests = mockSmsPortal(t, reply, status);
    assert.strictEqual(await sendQuoteSms(quotedCall), null);
    const log = requests.find((r) => r.url.startsWith("http://backend.test/notifications/"));
    assert.strictEqual(new URL(log.url).searchParams.get("status"), "failed");
  }
});

const { toE164, smsNumberFor } = require("../src/quoteConfirmation");

test("spoken South African numbers become +27 numbers", () => {
  assert.strictEqual(toE164("082 123 4567"), "+27821234567");
  assert.strictEqual(toE164("27821234567"), "+27821234567");
  assert.strictEqual(toE164("+27 82 123-4567"), "+27821234567");
  assert.strictEqual(toE164("+447700900123"), "+447700900123");
  assert.strictEqual(toE164("12345"), null);
  assert.strictEqual(toE164("client:demo"), null);
  assert.strictEqual(toE164(undefined), null);
});

test("the number the caller gave wins over the one they called from", () => {
  assert.strictEqual(
    smsNumberFor({ from: "+27820000001", factors: { mobile_number: "0831112222" } }),
    "+27831112222"
  );
  assert.strictEqual(smsNumberFor({ from: "+27820000001", factors: {} }), "+27820000001");
});

test("a browser demo call gets the SMS on the number given to the agent", async (t) => {
  useEnv(t, twilioEnv);
  const requests = mockFetch(t);

  await sendQuoteSms({
    ...quotedCall,
    from: "client:demo-browser",
    factors: { ...quotedCall.factors, mobile_number: "083 111 2222" }
  });

  const body = new URLSearchParams(requests[0].options.body);
  assert.strictEqual(body.get("To"), "+27831112222");
});
