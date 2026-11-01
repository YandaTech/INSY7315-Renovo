const { sendSms, logNotification } = require("./notifications");

// Only real phone numbers can get an SMS; browser demo calls arrive as
// "client:..." and are skipped.
const PHONE_NUMBER = /^\+\d{8,15}$/;

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

  if (
    !quote ||
    quote.status === "error" ||
    !(quote.estimated_quote > 0) ||
    !PHONE_NUMBER.test(call.from || "")
  ) {
    return null;
  }

  const message = buildQuoteMessage(call);

  try {
    return await send(call.from, message);
  } catch (error) {
    console.error("Failed to send quote SMS:", error.message);
    await logNotification({
      type: "sms",
      recipient: call.from,
      message,
      status: "failed"
    });
    return null;
  }
}

module.exports = { sendQuoteSms, buildQuoteMessage };
