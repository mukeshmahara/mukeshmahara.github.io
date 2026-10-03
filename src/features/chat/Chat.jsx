import React, { useState } from "react";
import "./Chat.css";
import VideoChat from "./components/videoChat/VideoChat";
import ChatInterface from "./components/ChatInterface";

const Chat = () => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleStartVideoCall = () => {
    setIsVideoCallActive(true);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
  };

  return (
    <div className="content-section">
      <div className="chat-header">
        <h2>Video Chat & Messaging</h2>

        {!isVideoCallActive ? (
          <button
            onClick={handleStartVideoCall}
            className="video-call-header-btn"
          >
            📹 Video Call
          </button>
        ) : (
          <button onClick={handleEndVideoCall} className="end-call-header-btn">
            📞 End Call
          </button>
        )}
      </div>

      <div className="chat-content">
        {isVideoCallActive ? (
          <div className="video-chat-section">
            <VideoChat onCallEnd={handleEndVideoCall} />
          </div>
        ) : (
          <div className="text-chat-section">
            <ChatInterface />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
