const WebSocket = require("ws");
const {
  createCall,
  getCall,
  updateCall,
  removeCall
} = require("./callState");

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

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

          case "media":
            console.log("Media chunk received");
            break;

          case "stop": {
            const callSid = data.stop?.callSid;

            console.log("Call stream stopped");

            if (callSid) {
              updateCall(callSid, {
                status: "completed",
                endedAt: new Date()
              });

              console.log("Call marked as completed:", callSid);

              removeCall(callSid);

              console.log("Call removed from active state:", callSid);
            }

            break;
          }

          default:
            console.log("Unknown WebSocket event:", data.event);
        }
      } catch (error) {
        console.log("Invalid WebSocket message:", message.toString());
      }
    });

    socket.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return wss;
}

module.exports = setupWebSocketServer;

