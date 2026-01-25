// components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  MessageCircle,
  Trash2,
  Sparkles,
} from "lucide-react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi 👋 I’m Mukesh’s AI assistant. Ask me about his skills, projects, or experience.",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your question! Mukesh is a Full Stack Developer skilled in React, Rails, and AI-powered systems.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="chat-bot-container">
      {!isOpen && (
        <button className="chat-launcher" onClick={() => setIsOpen(true)}>
          <MessageCircle />
          <span className="chat-tooltip">
            <Sparkles size={14} /> Chat with AI
          </span>
        </button>
      )}

      {isOpen && (
        <div className={`chat-window ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-title">
              <div className="bot-avatar">
                <Bot />
              </div>
              <div>
                <h4>AI Assistant</h4>
                <span>Local LLaMA 3</span>
              </div>
            </div>

            <div className="chat-actions">
              <button onClick={() => setMessages(messages.slice(0, 1))}>
                <Trash2 />
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 /> : <Minimize2 />}
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="chat-messages scrollbar-thin">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.sender}`}>
                    <div className="avatar">
                      {msg.sender === "bot" ? <Bot /> : <User />}
                    </div>
                    <div className="bubble">
                      <p>{msg.text}</p>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="chat-message bot">
                    <div className="avatar">
                      <Bot />
                    </div>
                    <div className="bubble loading">
                      <span className="dot"></span>
                      <span className="dot delay"></span>
                      <span className="dot delay2"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input">
                <textarea
                  placeholder="Ask something…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>
                  <Send />
                </button>
              </div>

              <p className="chat-footer">Powered by local LLaMA 3</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
