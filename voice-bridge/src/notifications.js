function sendSms(to, message) {
  console.log("SMS notification requested");
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);

  return {
    success: true,
    type: "sms",
    to,
    message
  };
}

function sendEmail(to, subject, message) {
  console.log("Email notification requested");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);

  return {
    success: true,
    type: "email",
    to,
    subject,
    message
  };
}

module.exports = {
  sendSms,
  sendEmail
};

