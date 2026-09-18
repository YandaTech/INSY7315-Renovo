const express = require("express");
const { createCall } = require("./callState");

const router = express.Router();

router.post("/voice", (req, res) => {
  const callSid = req.body.CallSid;

  if (callSid) {
    createCall(callSid, {
      from: req.body.From,
      to: req.body.To
    });

    console.log(`Tracking active call: ${callSid}`);
  }

  const twiml = `
    <Response>
      <Say>Welcome to Renovo. Your call has been received.</Say>
    </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

module.exports = router;

