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
import { llamaConfig } from "../utils/llamaConfig";

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

  const callLocalLlamaAPI = async (prompt, onToken) => {
    const response = await fetch(llamaConfig.getActiveEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:mini",
        prompt,
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        const json = JSON.parse(line);

        if (json.response) {
          fullText += json.response;
          onToken(json.response); // 👈 live update
        }
      }
    }

    return fullText;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Prepare empty bot message for streaming
    const botMessageId = userMessage.id + 1;

    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    try {
      await callLocalLlamaAPI(userMessage.text, (token) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: msg.text + token } : msg,
          ),
        );
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: "⚠️ Error connecting to AI model." }
            : msg,
        ),
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
