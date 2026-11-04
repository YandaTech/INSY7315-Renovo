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

// "james.smith@gmail.com" -> "j***@g***.com": enough to tell addresses
// apart in a log without exposing them.
function maskEmail(address) {
  const value = String(address ?? "");
  const at = value.lastIndexOf("@");

  if (at < 1) {
    return "*".repeat(value.length);
  }

  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const tld = dot > 0 ? domain.slice(dot) : "";

  return `${value[0]}***@${domain[0] || ""}***${tld}`;
}

const EMAIL_PATTERN = /[^\s@<>"']+@[^\s@<>"']+/g;

// Masks anything that looks like an email address inside free text, such
// as a provider error message that echoes the recipient.
function redactEmails(text) {
  return String(text ?? "").replace(EMAIL_PATTERN, (match) => maskEmail(match));
}

module.exports = {
  logCallContent,
  maskEmail,
  maskPhone,
  redactEmails,
  redactPhones
};
