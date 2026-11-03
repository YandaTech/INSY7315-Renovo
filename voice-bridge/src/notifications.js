async function logNotification({
  type,
  recipient,
  message,
  status = "sent",
  subject = null,
  providerId = null
}) {
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
  const serviceKey = process.env.SERVICE_API_KEY;

  if (!serviceKey) {
    console.error("SERVICE_API_KEY is not configured.");
    return null;
  }

  // Sent in the body so phone numbers and quote text never appear in a URL
  const body = { type, recipient, message, status };

  if (subject) {
    body.subject = subject;
  }

  if (providerId) {
    body.provider_id = providerId;
  }

  try {
    const response = await fetch(`${backendUrl}/notifications/`, {
      method: "POST",
      headers: {
        "X-Service-Key": serviceKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(
        `Notification logging failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to log notification:", error.message);
    return null;
  }
}


// SMSPortal (South Africa). SMSPORTAL_TEST_MODE=true makes SMSPortal
// accept and validate the send without delivering it or charging credits.
async function sendSmsPortalSms(to, message) {
  const clientId = process.env.SMSPORTAL_CLIENT_ID;
  const apiSecret = process.env.SMSPORTAL_API_SECRET;
  const apiUrl =
    process.env.SMSPORTAL_API_URL || "https://rest.smsportal.com/v3/BulkMessages";

  if (!clientId || !apiSecret) {
    throw new Error("SMSPortal credentials are not configured.");
  }

  const auth = Buffer.from(`${clientId}:${apiSecret}`).toString("base64");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sendOptions: { testMode: process.env.SMSPORTAL_TEST_MODE === "true" },
      // SMSPortal takes the MSISDN without the leading "+".
      messages: [{ destination: to.replace(/^\+/, ""), content: message }]
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = result.errors?.[0]?.errorMessage || result.errorMessage;
    throw new Error(reason || `SMSPortal returned ${response.status}`);
  }

  // The docs show both a wrapped ({ sendResponse: {...} }) and a flat reply.
  const sent = result.sendResponse || result;
  const fault = sent.errorReport?.faults?.[0];

  if (fault) {
    throw new Error(`SMSPortal rejected ${to}: ${fault.errorMessage || fault.status}`);
  }

  return sent.eventId != null ? String(sent.eventId) : null;
}

async function sendTwilioSms(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  // Twilio needs a sender: a Messaging Service, or a plain Twilio number.
  if (!accountSid || !authToken || !(messagingServiceSid || fromNumber)) {
    throw new Error("Twilio SMS credentials are not configured.");
  }

  const body = new URLSearchParams({ To: to, Body: message });

  if (messagingServiceSid) {
    body.append("MessagingServiceSid", messagingServiceSid);
  } else {
    body.append("From", fromNumber);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || `Twilio returned ${response.status}`
    );
  }

  return result.sid;
}

// AWS End User Messaging SMS. Credentials come from the SDK's default chain
// (the EC2 instance role in production), so no AWS keys go in .env. The SDK
// and client load on first use, so the other providers never touch AWS.
let awsSmsClient = null;

function getAwsSmsClient() {
  if (!awsSmsClient) {
    const { PinpointSMSVoiceV2Client } = require("@aws-sdk/client-pinpoint-sms-voice-v2");
    awsSmsClient = new PinpointSMSVoiceV2Client({
      region: process.env.AWS_REGION || "eu-north-1"
    });
  }
  return awsSmsClient;
}

// Swaps the AWS client, so tests never reach AWS. null resets it.
function setAwsSmsClient(client) {
  awsSmsClient = client;
}

async function sendAwsSms(to, message) {
  const { SendTextMessageCommand } = require("@aws-sdk/client-pinpoint-sms-voice-v2");
  const input = {
    DestinationPhoneNumber: to,
    MessageBody: message,
    MessageType: "TRANSACTIONAL"
  };

  // Without an origination identity AWS picks one from the account.
  if (process.env.AWS_SMS_ORIGINATION_IDENTITY) {
    input.OriginationIdentity = process.env.AWS_SMS_ORIGINATION_IDENTITY;
  }

  const result = await getAwsSmsClient().send(new SendTextMessageCommand(input));
  return result.MessageId || null;
}

const SMS_PROVIDERS = {
  aws: sendAwsSms,
  smsportal: sendSmsPortalSms,
  twilio: sendTwilioSms
};

// SMS_PROVIDER picks the gateway (aws, smsportal or twilio, default twilio).
async function sendSms(to, message) {
  const providerName = (process.env.SMS_PROVIDER || "twilio").toLowerCase();
  const send = SMS_PROVIDERS[providerName];

  if (!send) {
    throw new Error(`Unknown SMS_PROVIDER: ${providerName}`);
  }

  const providerId = await send(to, message);

  await logNotification({
    type: "sms",
    recipient: to,
    message,
    status: "sent",
    providerId
  });

  return {
    success: true,
    type: "sms",
    to,
    message,
    providerId
  };
}


async function sendEmail(to, subject, message) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("SendGrid email credentials are not configured.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }]
        }
      ],
      from: {
        email: fromEmail
      },
      subject,
      content: [
        {
          type: "text/plain",
          value: message
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `SendGrid returned ${response.status}: ${errorBody}`
    );
  }

  const providerId = response.headers.get("x-message-id");

  await logNotification({
    type: "email",
    recipient: to,
    subject,
    message,
    status: "sent",
    providerId
  });

  return {
    success: true,
    type: "email",
    to,
    subject,
    message,
    providerId
  };
}


module.exports = {
  logNotification,
  sendSms,
  setAwsSmsClient,
  sendEmail
};