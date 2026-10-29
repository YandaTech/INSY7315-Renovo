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

  const params = new URLSearchParams({
    type,
    recipient,
    message,
    status
  });

  if (subject) {
    params.append("subject", subject);
  }

  if (providerId) {
    params.append("provider_id", providerId);
  }

  try {
    const response = await fetch(
      `${backendUrl}/notifications/?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "X-Service-Key": serviceKey
        }
      }
    );

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


async function sendSms(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("Twilio SMS credentials are not configured.");
  }

  const body = new URLSearchParams({
    To: to,
    Body: message,
    MessagingServiceSid: messagingServiceSid
  });

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

  await logNotification({
    type: "sms",
    recipient: to,
    message,
    status: "sent",
    providerId: result.sid
  });

  return {
    success: true,
    type: "sms",
    to,
    message,
    providerId: result.sid
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
  sendSms,
  sendEmail
};