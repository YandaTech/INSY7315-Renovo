const {
  sendSms,
  sendEmail,
  emailEnabled,
  logNotification
} = require("./notifications");
const { redactEmails, redactPhones } = require("./privacy");

// Only real phone numbers can get an SMS; browser demo calls arrive as
// "client:..." and need the number the caller gave the agent.
const PHONE_NUMBER = /^\+\d{8,15}$/;

// Turns a spoken South African number ("082 123 4567", "27821234567")
// into +27821234567. Returns null if it isn't a usable number.
function toE164(raw) {
  if (!raw) {
    return null;
  }

  const digits = String(raw).replace(/[^\d+]/g, "");
  let number = digits;

  if (/^0\d{9}$/.test(digits)) {
    number = `+27${digits.slice(1)}`;
  } else if (/^27\d{9}$/.test(digits)) {
    number = `+${digits}`;
  }

  return PHONE_NUMBER.test(number) ? number : null;
}

// The number the caller asked for wins over the one they called from.
function smsNumberFor(call) {
  return toE164(call?.factors?.mobile_number) || toE164(call?.from);
}

function formatRand(amount) {
  return `R${Math.round(amount).toLocaleString("en-US")}`;
}

function buildQuoteMessage(call) {
  const name = call.factors?.caller_name;
  const job = call.factors?.job_type?.replace(/_/g, " ");
  const greeting = name ? `Hi ${name}, thanks` : "Thanks";
  const jobPart = job ? ` for your ${job}` : "";

  return (
    `${greeting} for calling Renovo Cape. ` +
    `Your estimated quote${jobPart} is ${formatRand(call.quote.estimated_quote)}. ` +
    "Our team will be in touch to confirm the details."
  );
}

// Texts the caller their quote after a quoted call. Never throws: a failed
// SMS is logged as "failed" and must not stop the call and lead being saved.
async function sendQuoteSms(call, send = sendSms) {
  const quote = call?.quote;
  const to = smsNumberFor(call);

  if (!quote || quote.status === "error" || !(quote.estimated_quote > 0) || !to) {
    return null;
  }

  const message = buildQuoteMessage(call);

  try {
    return await send(to, message);
  } catch (error) {
    // Provider errors can echo the recipient, so mask numbers first.
    console.error("Failed to send quote SMS:", redactPhones(error.message));
    await logNotification({
      type: "sms",
      recipient: to,
      message,
      status: "failed"
    });
    return null;
  }
}

const EMAIL_ADDRESS = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

// Turns the email the agent collected into a plain address. The agent is
// asked to pass "name@example.com", but speech recognition can leave the
// spoken form ("james dot smith at gmail dot com"). Returns null if it
// still isn't a usable address, so a misheard email is never sent.
function toEmailAddress(raw) {
  if (!raw) {
    return null;
  }

  let value = String(raw).trim().toLowerCase();

  if (!value.includes("@")) {
    value = value.replace(/\s+at\s+/g, "@");
  }

  value = value
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+(dash|hyphen)\s+/g, "-")
    .replace(/\s+/g, "");

  return EMAIL_ADDRESS.test(value) ? value : null;
}

function emailFor(call) {
  return toEmailAddress(call?.factors?.email);
}

const QUOTE_EMAIL_SUBJECT = "Your Renovo Cape quote";

function buildQuoteEmail(call) {
  return (
    `${buildQuoteMessage(call)}\n\n` +
    "This is an estimate. The final price is confirmed once our team has " +
    "seen the job.\n\n" +
    "Renovo Cape"
  );
}

function isQuoted(call) {
  const quote = call?.quote;
  return Boolean(quote && quote.status !== "error" && quote.estimated_quote > 0);
}

// Emails the caller their quote after a quoted call, if they gave an email
// and EMAIL_PROVIDER is set. Never throws: a failed email is logged as
// "failed" and must not stop the call and lead being saved.
async function sendQuoteEmail(call, send = sendEmail) {
  const to = emailFor(call);

  if (!isQuoted(call) || !to) {
    return null;
  }

  if (!emailEnabled()) {
    console.log("Quote email skipped: EMAIL_PROVIDER is not set.");
    return null;
  }

  const message = buildQuoteEmail(call);

  try {
    return await send(to, QUOTE_EMAIL_SUBJECT, message);
  } catch (error) {
    // Provider errors can echo the recipient, so mask addresses first.
    console.error(
      "Failed to send quote email:",
      redactPhones(redactEmails(error.message))
    );
    await logNotification({
      type: "email",
      recipient: to,
      subject: QUOTE_EMAIL_SUBJECT,
      message,
      status: "failed"
    });
    return null;
  }
}

module.exports = {
  sendQuoteSms,
  sendQuoteEmail,
  buildQuoteMessage,
  buildQuoteEmail,
  smsNumberFor,
  emailFor,
  toE164,
  toEmailAddress,
  QUOTE_EMAIL_SUBJECT
};
