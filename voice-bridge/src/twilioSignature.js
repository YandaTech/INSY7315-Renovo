const crypto = require("crypto");

// Twilio signs every webhook: HMAC-SHA1 (keyed with the account's auth
// token) over the full URL it called plus the POST params sorted by name
// and concatenated as name+value, base64-encoded in X-Twilio-Signature.
// https://www.twilio.com/docs/usage/security#validating-requests
function computeSignature(authToken, url, params = {}) {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  return crypto.createHmac("sha1", authToken).update(data).digest("base64");
}

function isValidSignature(authToken, signature, url, params) {
  if (!signature) {
    return false;
  }

  const expected = Buffer.from(computeSignature(authToken, url, params));
  const actual = Buffer.from(signature);

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

// The URL Twilio called. Behind Caddy, the Host and X-Forwarded-Proto
// headers carry the public address; PUBLIC_VOICE_URL overrides both.
function publicUrl(req) {
  const base =
    process.env.PUBLIC_VOICE_URL ||
    `${req.protocol}://${req.get("host")}`;

  return base.replace(/\/$/, "") + req.originalUrl;
}

// ENVIRONMENT=production (the same switch the backend uses) turns off
// every local-dev escape hatch, so a missing secret fails closed.
function isProduction() {
  return (process.env.ENVIRONMENT || "").toLowerCase() === "production";
}

// Called once at startup. In production: warns about dev-only flags that
// are ignored, and throws when TWILIO_AUTH_TOKEN is missing.
function assertSecureConfig() {
  if (!isProduction()) {
    return;
  }

  if (process.env.ALLOW_UNVERIFIED_CALLS === "true") {
    console.warn("ALLOW_UNVERIFIED_CALLS=true is ignored in production");
  }
  if (process.env.VALIDATE_TWILIO_SIGNATURE === "false") {
    console.warn("VALIDATE_TWILIO_SIGNATURE=false is ignored in production");
  }
  if (!process.env.TWILIO_AUTH_TOKEN) {
    throw new Error(
      "Refusing to start in production: TWILIO_AUTH_TOKEN is not set, " +
        "so Twilio webhook signatures cannot be checked"
    );
  }
}

// ALLOW_UNVERIFIED_CALLS lets simulate-call.js stream without a /voice
// webhook first. Never honoured in production.
function allowUnverifiedCalls() {
  return !isProduction() && process.env.ALLOW_UNVERIFIED_CALLS === "true";
}

// Rejects webhooks not signed by our Twilio account. In local dev it is
// off when there's no auth token or VALIDATE_TWILIO_SIGNATURE=false; in
// production neither applies, and a missing token rejects every request.
function requireTwilioSignature(req, res, next) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (isProduction()) {
    if (!authToken) {
      console.error(
        "Rejected webhook: TWILIO_AUTH_TOKEN is not set in production:",
        publicUrl(req)
      );
      return res.status(403).send("Twilio signature cannot be verified");
    }
  } else if (!authToken || process.env.VALIDATE_TWILIO_SIGNATURE === "false") {
    return next();
  }

  const signature = req.get("X-Twilio-Signature");

  if (isValidSignature(authToken, signature, publicUrl(req), req.body)) {
    return next();
  }

  console.warn("Rejected webhook with invalid Twilio signature:", publicUrl(req));
  res.status(403).send("Invalid Twilio signature");
}

module.exports = {
  computeSignature,
  isValidSignature,
  isProduction,
  assertSecureConfig,
  allowUnverifiedCalls,
  requireTwilioSignature
};
