// Hangs up via Twilio's REST API - there's no way to end a call from
// inside a ConversationRelay message. Needs the Account SID ("AC..."),
// not an API Key SID ("SK...").
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
