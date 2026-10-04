const WebSocket = require("ws");

const {
  createCall,
  getCall,
  updateCall,
  removeCall
} = require("./callState");

const { saveCall } = require("./backendClient");
const { sendToAgent, endAgentSession } = require("./agentClient");
const { hangUpCall } = require("./twilioClient");

// Rough estimate so we don't hang up over the agent's own goodbye.
function estimateSpeechMs(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2000, (wordCount / 2.5) * 1000 + 1000);
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

              if (callSid) {
                if (getCall(callSid)) {
                  updateCall(callSid, { status: "streaming" });
                } else {
                  createCall(callSid, { status: "streaming" });
                }
              }

              break;
            }

            case "prompt": {
              const callSid = activeCallSid;
              const userText = data.voicePrompt;

              console.log("Caller said:", userText);

              if (callSid && userText) {
                const { reply, factors, quote, end_call: shouldEndCall } =
                  await sendToAgent(callSid, userText);

                updateCall(callSid, { factors, quote });

                socket.send(
                  JSON.stringify({
                    type: "text",
                    token: reply,
                    last: true
                  })
                );

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

            case "end": {
              const callSid = activeCallSid;

              console.log("ConversationRelay session ended:", callSid);

              if (callSid) {
                const currentCall = getCall(callSid);

                if (currentCall) {
                  const endedAt = new Date();
                  const duration = Math.round(
                    (endedAt - new Date(currentCall.startedAt)) / 1000
                  );

                  const savedCall = await saveCall({
                    callSid,
                    duration,
                    transcript: JSON.stringify(currentCall.factors || {}),
                    outcome: currentCall.quote ? "quoted" : "completed"
                  });

                  if (savedCall) {
                    await endAgentSession(callSid);
                    removeCall(callSid);
                  } else {
                    updateCall(callSid, { status: "save_failed" });
                  }
                }
              }

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

