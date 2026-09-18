const express = require("express");

const router = express.Router();

router.post("/voice", (req, res) => {
  const twiml = `
    <Response>
      <Say>Welcome to Renovo. Your call has been received.</Say>
    </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

module.exports = router;

