import React, { useState } from "react";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;

    const message = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => [...previous, message]);
    setNewMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "I'm a demo bot! This is an automated response.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((previous) => [...previous, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="chat-interface-container project-card">
      <div className="chat-interface-header">
        <h3>💬 Text Chat</h3>
        <span className="chat-status">Online</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="chat-icon">💬</div>
            <p>Start a conversation...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              <div className="message-content">{message.text}</div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="typing-indicator">
            <span>Typing</span>
            <div className="typing-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="chat-input"
        />

        <button
          onClick={sendMessage}
          className="nav-button btn-primary send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
