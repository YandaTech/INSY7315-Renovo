const WebSocket = require("ws");

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.on("message", (message) => {
      console.log("WebSocket message received:", message.toString());
    });

    socket.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return wss;
}

module.exports = setupWebSocketServer;



