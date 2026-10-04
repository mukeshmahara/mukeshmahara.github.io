import React, { useCallback, useState } from "react";
import "./Chat.css";
import VideoChat from "./components/videoChat/VideoChat";
import ChatInterface from "./components/ChatInterface";

const Chat = () => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleStartVideoCall = useCallback(() => {
    setIsVideoCallActive(true);
  }, []);

  const handleEndVideoCall = useCallback(() => {
    setIsVideoCallActive(false);
  }, []);

  const callButton = isVideoCallActive
    ? {
        label: "📞 End Call",
        className: "end-call-header-btn",
        onClick: handleEndVideoCall,
      }
    : {
        label: "📹 Video Call",
        className: "video-call-header-btn",
        onClick: handleStartVideoCall,
      };

  const renderChatPanel = () =>
    isVideoCallActive ? (
      <div className="video-chat-section">
        <VideoChat onCallEnd={handleEndVideoCall} />
      </div>
    ) : (
      <div className="text-chat-section">
        <ChatInterface />
      </div>
    );

  return (
    <div className="content-section">
      <div className="chat-header">
        <h2>Video Chat & Messaging</h2>

        <button onClick={callButton.onClick} className={callButton.className}>
          {callButton.label}
        </button>
      </div>

      <div className="chat-content">{renderChatPanel()}</div>
    </div>
  );
};

export default Chat;
