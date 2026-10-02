import React, { useState } from "react";
import "./Chat.css";
import VideoChat from "./components/VideoChat";
import ChatInterface from "./components/ChatInterface";
import QuickActions from "./components/QuickActions";

const Chat = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="content-section">
      <div className="chat-header">
        <h2>Video Chat & Messaging</h2>
        <p className="chat-subtitle">
          Connect with others via video call or text chat
        </p>
      </div>

      <div className="chat-tabs">
        <button
          onClick={() => setActiveTab("video")}
          className={`nav-button ${activeTab === "video" ? "active" : ""}`}
        >
          📹 Video Call
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`nav-button ${activeTab === "chat" ? "active" : ""}`}
        >
          💬 Text Chat
        </button>
      </div>

      <div className="chat-content">
        {activeTab === "video" ? (
          <div className="video-chat-section">
            <VideoChat />
          </div>
        ) : (
          <div className="text-chat-section">
            <ChatInterface />
          </div>
        )}

        <QuickActions />
      </div>
    </div>
  );
};

export default Chat;
