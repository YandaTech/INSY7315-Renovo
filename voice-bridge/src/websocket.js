const WebSocket = require("ws");

const {
  createCall,
  getCall,
  updateCall,
  removeCall
} = require("./callState");

const { saveCall } = require("./backendClient");
const { sendToAgent, endAgentSession } = require("./agentClient");

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Twilio ConversationRelay messages use a "type" field and carry
        // plain text (it does STT/TTS for us). Classic Media Streams
        // messages use an "event" field and carry raw audio - handled
        // below in the switch statement for backward compatibility.
        if (data.type) {
          switch (data.type) {
            case "setup": {
              const callSid = data.callSid;

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
              const callSid = data.callSid;
              const userText = data.voicePrompt;

              console.log("Caller said:", userText);

              if (callSid && userText) {
                const { reply, factors, quote } = await sendToAgent(
                  callSid,
                  userText
                );

                updateCall(callSid, { factors, quote });

                socket.send(
                  JSON.stringify({
                    type: "text",
                    token: reply,
                    last: true
                  })
                );
              }

              break;
            }

            case "interrupt": {
              console.log("Caller interrupted the agent's speech");
              break;
            }

            case "end": {
              const callSid = data.callSid;

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

        switch (data.event) {
          case "start": {
            const streamSid = data.start?.streamSid;
            const callSid = data.start?.callSid;

            console.log("Call stream started");
            console.log("Stream SID:", streamSid);
            console.log("Call SID:", callSid);

            if (callSid) {
              const existingCall = getCall(callSid);

              if (existingCall) {
                updateCall(callSid, {
                  streamSid,
                  status: "streaming"
                });
              } else {
                createCall(callSid, {
                  streamSid,
                  status: "streaming"
                });
              }

              console.log("Call state updated for:", callSid);
            }

            break;
          }

          case "media": {
            console.log("Media chunk received");

            // Later, this is where the Twilio audio payload
            // will be forwarded to Ali's AI agent.
            break;
          }

          case "stop": {
            const callSid = data.stop?.callSid;

            console.log("Call stream stopped");

            if (callSid) {
              const currentCall = getCall(callSid);

              if (currentCall) {
                const endedAt = new Date();

                const duration = Math.round(
                  (endedAt - new Date(currentCall.startedAt)) / 1000
                );

                updateCall(callSid, {
                  status: "completed",
                  endedAt
                });

                console.log("Call marked as completed:", callSid);

                const savedCall = await saveCall({
                  callSid,
                  duration,
                  transcript: currentCall.transcript || "",
                  outcome: "completed"
                });

                if (savedCall) {
                  console.log(
                    "Completed call successfully saved to backend:",
                    callSid
                  );

                  await endAgentSession(callSid);
                  removeCall(callSid);

                  console.log(
                    "Call removed from active state:",
                    callSid
                  );
                } else {
                  console.log(
                    "Call was not removed because backend save failed:",
                    callSid
                  );

                  updateCall(callSid, {
                    status: "save_failed"
                  });
                }
              } else {
                console.log(
                  "No active call found for:",
                  callSid
                );
              }
            }

            break;
          }

          default:
            console.log(
              "Unknown WebSocket event:",
              data.event
            );
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

