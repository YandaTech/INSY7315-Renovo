<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Notifications

Goal: Callers receive a real confirmation after their quote

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0023 | voice-bridge | SMS quote confirmation through Twilio | After a quoted call the caller gets an SMS from TWILIO_FROM_NUMBER; tests mock the Twilio client | - | - | 🟩 Done · e69040c · 2026-11-01 · tests passed |
| RN-0024 | infra | Choose an email provider and verify a sender domain | Provider account exists and the sender domain is verified | - | - | 🟥 Pending · Needs a human: needs an account and DNS access |
| RN-0025 | voice-bridge | Email quote confirmation when the caller gives an email | A test shows a quoted call with an email sends one confirmation through the chosen provider | RN-0024 | - | 🟥 Pending |
| RN-0043 | frontend | Statistics page shows sent SMS and email counts | Statistics shows SMS and email counts read from /notifications/, matching the notification log | RN-0023, RN-0025 | - | 🟥 Pending |
