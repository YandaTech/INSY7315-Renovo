<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Notifications

Goal: Callers receive a real confirmation after their quote

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0023 | voice-bridge | SMS quote confirmation through Twilio | After a quoted call the caller gets an SMS from TWILIO_FROM_NUMBER; tests mock the Twilio client | - | - | 🟩 Done · e69040c · 2026-11-01 · tests passed |
| RN-0024 | infra | Choose an email provider and verify a sender domain | Provider account exists and the sender domain is verified | - | - | 🟥 Pending · Needs a human: needs an account and DNS access |
| RN-0025 | voice-bridge | Email quote confirmation when the caller gives an email | A test shows a quoted call with an email sends one confirmation through the chosen provider | RN-0024 | - | 🟥 Pending |
| RN-0043 | frontend | Statistics page shows sent SMS and email counts | Statistics shows SMS and email counts read from /notifications/, matching the notification log | RN-0023, RN-0025 | - | 🟥 Pending |
| RN-0044 | voice-bridge | Quote SMS through SMSPortal | With SMS_PROVIDER=smsportal the quote SMS goes through SMSPortal's REST API; tests mock SMSPortal and a testMode call succeeds | RN-0023 | path:voice-bridge/src/notifications.js path:voice-bridge/test/** | 🟩 Done · 8519d4a · 2026-11-01 · tests passed · Note: Live testMode call to rest.smsportal.com/v3/BulkMessages returned 200 with the account's keys |
| RN-0045 | voice-bridge | Agent asks for a mobile number to text the quote to | The agent collects mobile_number, the quote SMS and the lead contact use it (so browser demo calls get an SMS), with tests | RN-0023 | path:ai-agent/prompts.py path:ai-agent/tools.py path:voice-bridge/src/** path:voice-bridge/test/** | 🟩 Done · e354fc0 · 2026-11-01 · tests passed |
| RN-0046 | voice-bridge | Quote SMS through AWS End User Messaging | With SMS_PROVIDER=aws the server's instance role sends the quote SMS via AWS; tests mock AWS; a real SMS reaches a verified number | RN-0023 | path:voice-bridge/** | 🟥 Pending · Needs a human: AWS login, verifying destination numbers by OTP · Blocked: AWS org SCP p-drkcpz04 explicitly denies sms-voice (SMS and SNS SMS) on the Free-plan account; needs a paid AWS plan or another provider |
