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

// Rejects webhooks not signed by our Twilio account. Off when there's no
// auth token (local dev) or VALIDATE_TWILIO_SIGNATURE=false.
function requireTwilioSignature(req, res, next) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken || process.env.VALIDATE_TWILIO_SIGNATURE === "false") {
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
  requireTwilioSignature
};
