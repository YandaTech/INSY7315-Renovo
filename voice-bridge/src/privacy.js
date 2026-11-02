const { isProduction } = require("./twilioSignature");

// Logs carry call SIDs, lengths and outcomes - never what the caller or
// the agent said, names or phone numbers. LOG_CALL_CONTENT=true prints
// the conversation for local debugging; it is ignored in production.
function logCallContent() {
  return !isProduction() && process.env.LOG_CALL_CONTENT === "true";
}

// "+27821234567" -> "+2782*****67": enough to tell numbers apart in a
// log without exposing them.
function maskPhone(number) {
  const value = String(number ?? "");
  const digits = value.replace(/\D/g, "");

  if (digits.length < 7) {
    return "*".repeat(value.length);
  }

  const prefix = value.startsWith("+") ? "+" : "";
  return `${prefix}${digits.slice(0, 4)}${"*".repeat(digits.length - 6)}${digits.slice(-2)}`;
}

// Masks anything that looks like a phone number inside free text, such as
// a provider error message that echoes the recipient.
function redactPhones(text) {
  return String(text ?? "").replace(/\+?\d[\d\s-]{6,}\d/g, (match) =>
    maskPhone(match)
  );
}

module.exports = { logCallContent, maskPhone, redactPhones };
