const WEBSOCKET_URL = "wss://ws.postman-echo.com/raw";
const CONNECTION_TIMEOUT = 3000;

export const createSignalingServer = () => {
  const listeners = new Set();

  let socket = null;
  let isWebSocketConnected = false;

  const notify = (message) => {
    listeners.forEach((callback) => callback(message));
  };

  const connectWebSocket = () =>
    new Promise((resolve) => {
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      try {
        socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
          console.log("✅ Connected to WebSocket server");
          isWebSocketConnected = true;
          finish(true);
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            notify(message);
          } catch {
            console.log("📥 WebSocket message:", event.data);
          }
        };

        socket.onerror = () => {
          console.log("⚠️ WebSocket connection failed, using mock mode");
          isWebSocketConnected = false;
          finish(false);
        };

        socket.onclose = () => {
          isWebSocketConnected = false;
          console.log("🔴 WebSocket disconnected");
        };

        setTimeout(() => {
          if (!isWebSocketConnected) {
            console.log("⏱️ WebSocket timed out, using mock mode");
            finish(false);
          }
        }, CONNECTION_TIMEOUT);
      } catch (error) {
        console.log("❌ WebSocket not available:", error.message);
        finish(false);
      }
    });

  return {
    async connect(roomId) {
      console.log(`🟡 Connecting to signaling, room: ${roomId}`);

      const connected = await connectWebSocket();

      if (connected && socket) {
        console.log("✅ Using WebSocket signaling");

        socket.send(
          JSON.stringify({
            type: "join-room",
            room: roomId,
          }),
        );
      } else {
        console.log("🟡 Using mock signaling for demo");
      }
    },

    disconnect() {
      if (socket) {
        socket.close();
        socket = null;
      }

      isWebSocketConnected = false;
      console.log("🔴 Disconnected from signaling server");
    },

    sendMessage(message) {
      console.log("📤 Sending message:", message.type);

      if (socket && isWebSocketConnected) {
        socket.send(
          JSON.stringify({
            ...message,
            timestamp: Date.now(),
          }),
        );
        return;
      }

      // Demo-only fallback.
      setTimeout(() => {
        if (message.type === "offer") {
          notify({
            type: "answer",
            sdp: "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n...",
            from: "remote-peer",
          });
        }
      }, 1000);
    },

    onMessage(callback) {
      listeners.add(callback);

      return () => {
        listeners.delete(callback);
      };
    },

    simulateRemoteOffer() {
      notify({
        type: "offer",
        sdp: "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n...",
        from: "remote-peer",
      });
    },

    sendToPeer(peerId, data) {
      if (!socket || !isWebSocketConnected) return;

      socket.send(
        JSON.stringify({
          type: "peer-message",
          to: peerId,
          data,
        }),
      );
    },

    getConnectionType() {
      return isWebSocketConnected ? "websocket" : "mock";
    },
  };
};
