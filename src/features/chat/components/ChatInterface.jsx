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
      <div className="flex items-center gap-2 w-full p-2 rounded-2xl bg-slate-900/80 border border-slate-700/50 shadow-lg backdrop-blur-sm">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (newMessage.trim()) {
                sendMessage();
              }
            }
          }}
          placeholder="Type a message..."
          aria-label="Message"
          className="
      flex-1
      min-w-0
      h-12
      px-4
      text-sm sm:text-base
      text-slate-100
      placeholder:text-slate-500
      bg-transparent
      border-0
      outline-none
      focus:ring-0
    "
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          aria-label="Send message"
          title="Send message"
          className="
      shrink-0
      w-12
      h-12
      rounded-xl
      flex
      items-center
      justify-center
      bg-blue-600
      text-white
      shadow-md
      transition-all
      duration-200
      hover:bg-blue-500
      hover:scale-105
      active:scale-95
      disabled:bg-slate-700
      disabled:text-slate-500
      disabled:cursor-not-allowed
      disabled:hover:scale-100
    "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M22 2L11 13"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M22 2L15 22L11 13L2 9L22 2Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
