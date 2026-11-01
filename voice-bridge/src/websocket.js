const WebSocket = require("ws");

const {
  createCall,
  getCall,
  updateCall,
  removeCall
} = require("./callState");

const { saveCall, saveLead } = require("./backendClient");
const { streamFromAgent, endAgentSession } = require("./agentClient");
const { hangUpCall } = require("./twilioClient");
const { WELCOME_GREETING } = require("./greeting");
const { sendQuoteSms } = require("./quoteConfirmation");

// Rough estimate so we don't hang up over the agent's own goodbye.
function estimateSpeechMs(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2000, (wordCount / 2.5) * 1000 + 1000);
}

function appendTranscript(callSid, speaker, text) {
  const call = getCall(callSid);

  if (call) {
    updateCall(callSid, {
      transcript: [...(call.transcript || []), `${speaker}: ${text}`]
    });
  }
}

// A quoted call becomes a "new" lead; a call that hung up before a quote
// still leaves an "incomplete" lead so staff can phone the number back.
function buildLead(callSid, call) {
  const { caller_name: callerName, ...jobDetails } = call.factors || {};

  return {
    callSid,
    name: callerName || "Unknown caller",
    contact: call.from || "unknown",
    quote: call.quote?.estimated_quote ?? 0,
    status: call.quote ? "new" : "incomplete",
    jobDetails
  };
}

// Saves the call and its lead, then forgets it. Runs when the socket
// closes (how real Twilio calls end) or on a simulated "end" message;
// the "finished" flag makes sure each call is saved only once.
async function finishCall(callSid) {
  const call = callSid && getCall(callSid);

  if (!call || call.finished) {
    return;
  }

  updateCall(callSid, { finished: true });

  const duration = Math.round((Date.now() - new Date(call.startedAt)) / 1000);

  console.log(`Call ended: ${callSid} (${duration}s)`);

  const savedCall = await saveCall({
    callSid,
    duration,
    transcript: (call.transcript || []).join("\n"),
    outcome: call.quote ? "quoted" : "incomplete"
  });

  if (savedCall) {
    await saveLead(buildLead(callSid, call));
    await endAgentSession(callSid);
    removeCall(callSid);
    await sendQuoteSms(call);
  } else {
    updateCall(callSid, { status: "save_failed", finished: false });
  }
}

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    // callSid only arrives on "setup" - later messages don't repeat it.
    let activeCallSid = null;

    socket.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // ConversationRelay messages use "type".
        if (data.type) {
          switch (data.type) {
            case "setup": {
              const callSid = data.callSid;
              activeCallSid = callSid;

              console.log("ConversationRelay session started:", callSid);

              // Only calls announced by a (signature-checked) /voice webhook
              // may stream, so nobody can run up agent costs with made-up
              // call SIDs. ALLOW_UNVERIFIED_CALLS lets simulate-call.js in.
              if (
                callSid &&
                !getCall(callSid) &&
                process.env.ALLOW_UNVERIFIED_CALLS !== "true"
              ) {
                console.warn("Rejected stream for unknown call:", callSid);
                socket.close(1008, "Unknown call");
                return;
              }

              if (callSid) {
                if (getCall(callSid)) {
                  updateCall(callSid, { status: "streaming" });
                } else {
                  createCall(callSid, {
                    status: "streaming",
                    from: data.from,
                    to: data.to
                  });
                }

                appendTranscript(callSid, "Agent", WELCOME_GREETING);
              }

              break;
            }

            case "prompt": {
              const callSid = activeCallSid;
              const userText = data.voicePrompt;

              console.log("Caller said:", userText);

              if (callSid && userText) {
                appendTranscript(callSid, "Caller", userText);

                // Pass text to ConversationRelay as it streams in, so the
                // caller hears the start of the reply without waiting for
                // the whole thing; last:true below marks the end.
                const { reply, factors, quote, end_call: shouldEndCall } =
                  await streamFromAgent(callSid, userText, (token) => {
                    socket.send(
                      JSON.stringify({ type: "text", token, last: false })
                    );
                  });

                socket.send(JSON.stringify({ type: "text", token: "", last: true }));

                updateCall(callSid, { factors: factors || {}, quote });
                appendTranscript(callSid, "Agent", reply);

                console.log("Agent said:", reply);
                if (quote) {
                  console.log("Quote:", JSON.stringify(quote));
                }

                if (shouldEndCall) {
                  setTimeout(() => {
                    hangUpCall(callSid);
                  }, estimateSpeechMs(reply));
                }
              }

              break;
            }

            case "interrupt": {
              console.log("Caller interrupted the agent's speech");
              break;
            }

            case "error": {
              console.error("ConversationRelay error:", JSON.stringify(data));
              break;
            }

            // Our simulator sends "end"; real ConversationRelay calls just
            // close the socket, which finishCall also handles below.
            case "end": {
              await finishCall(activeCallSid);
              break;
            }

            default:
              console.log(
                "Unknown ConversationRelay message type:",
                data.type
              );
          }

          return;
        }

      } catch (error) {
        console.error(
          "Error processing WebSocket message:",
          error.message
        );
      }
    });

    socket.on("close", () => {
      console.log("WebSocket client disconnected");
      finishCall(activeCallSid).catch((error) =>
        console.error("Failed to finish call:", error.message)
      );
    });

    socket.on("error", (error) => {
      console.error(
        "WebSocket error:",
        error.message
      );
    });
  });

  return wss;
}

module.exports = setupWebSocketServer;

