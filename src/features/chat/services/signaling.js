import { io } from "socket.io-client";

const SIGNALING_SERVER_URL =
  import.meta.env.VITE_SIGNALING_SERVER_URL ||
  "https://signaling.mukeshmahara.com.np/";

export const createSignalingServer = () => {
  let socket = null;
  let currentRoomId = null;

  const listeners = new Set();

  const notify = (message) => {
    listeners.forEach((callback) => {
      callback(message);
    });
  };

  return {
    connect(roomId) {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      currentRoomId = roomId;

      if (socket?.connected) {
        socket.emit("join-room", roomId);
        return;
      }

      socket = io(SIGNALING_SERVER_URL, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("🟢 Socket.IO connected:", socket.id);

        socket.emit("join-room", roomId);
      });

      socket.on("room-joined", (data) => {
        console.log("🚪 Joined room:", data.roomId);

        notify({
          type: "room-joined",
          ...data,
        });
      });

      socket.on("user-joined", (data) => {
        console.log("👤 Another user joined:", data.socketId);

        notify({
          type: "user-joined",
          ...data,
        });
      });

      socket.on("offer", (data) => {
        console.log("📥 Received offer");

        notify({
          type: "offer",
          ...data,
        });
      });

      socket.on("answer", (data) => {
        console.log("📥 Received answer");

        notify({
          type: "answer",
          ...data,
        });
      });

      socket.on("ice-candidate", (data) => {
        notify({
          type: "ice-candidate",
          ...data,
        });
      });

      socket.on("user-left", (data) => {
        console.log("👋 User left:", data.socketId);

        notify({
          type: "user-left",
          ...data,
        });
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Socket.IO disconnected:", reason);

        notify({
          type: "disconnected",
          reason,
        });
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket.IO connection error:", error);

        notify({
          type: "connection-error",
          error,
        });
      });
    },

    sendMessage(message) {
      if (!socket?.connected) {
        console.warn("⚠️ Socket.IO is not connected");
        return;
      }

      if (!currentRoomId) {
        console.warn("⚠️ No active room");
        return;
      }

      switch (message.type) {
        case "offer":
          socket.emit("offer", {
            roomId: currentRoomId,
            offer: message.offer,
          });
          break;

        case "answer":
          socket.emit("answer", {
            roomId: currentRoomId,
            answer: message.answer,
          });
          break;

        case "ice-candidate":
          socket.emit("ice-candidate", {
            roomId: currentRoomId,
            candidate: message.candidate,
          });
          break;

        default:
          console.warn("⚠️ Unknown signaling message:", message.type);
      }
    },

    onMessage(callback) {
      listeners.add(callback);

      return () => {
        listeners.delete(callback);
      };
    },

    disconnect() {
      if (socket) {
        if (currentRoomId) {
          socket.emit("leave-room", currentRoomId);
        }

        socket.disconnect();
        socket = null;
      }

      currentRoomId = null;

      console.log("🔴 Disconnected from signaling");
    },

    getConnectionType() {
      return socket?.connected ? "socket.io" : "disconnected";
    },

    getSocketId() {
      return socket?.id || null;
    },

    isConnected() {
      return Boolean(socket?.connected);
    },
  };
};
