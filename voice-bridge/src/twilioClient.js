// Ends a call via Twilio's REST API (used when the AI agent decides the
// conversation is over, via the end_call tool - Twilio doesn't offer a way
// to hang up from inside a ConversationRelay message).
//
// Requires the real Account SID (starts with "AC...") + Auth Token, not an
// API Key SID (starts with "SK...") - those are different credentials.
async function hangUpCall(callSid) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !accountSid.startsWith("AC")) {
    console.error(
      "Cannot hang up call: TWILIO_ACCOUNT_SID must be the Account SID " +
        `(starts with "AC"), not an API Key SID. Got: ${accountSid}`
    );
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ Status: "completed" }).toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio returned ${response.status} ${response.statusText}`);
    }

    console.log("Hung up call via Twilio REST API:", callSid);
    return true;
  } catch (error) {
    console.error("Failed to hang up call:", error.message);
    return false;
  }
}

module.exports = { hangUpCall };
