const WebSocket = require("ws");

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.event) {
          case "start":
            console.log("Call stream started");
            console.log("Stream SID:", data.start?.streamSid);
            console.log("Call SID:", data.start?.callSid);
            break;

          case "media":
            console.log("Media chunk received");
            break;

          case "stop":
            console.log("Call stream stopped");
            break;

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

