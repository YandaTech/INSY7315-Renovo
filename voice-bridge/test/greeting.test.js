const test = require("node:test");
const assert = require("node:assert");

const { WELCOME_GREETING } = require("../src/greeting");

test("the welcome greeting says the caller is speaking to an AI and the call is transcribed", () => {
  assert.match(WELCOME_GREETING, /\bAI assistant\b/);
  assert.match(WELCOME_GREETING, /\btranscribed\b/);
  assert.match(WELCOME_GREETING, /Renovo Cape/);
});

test("the welcome greeting is plain speech for text-to-speech", () => {
  // No markdown or symbols the TTS voice would read out.
  assert.doesNotMatch(WELCOME_GREETING, /[*_#&%@/<>]/);
});
