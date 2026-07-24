"use client";

import { useState, useEffect, useRef } from "react";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID
  useEffect(() => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Poll for messages when open
  useEffect(() => {
    if (!sessionId || !isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error polling chat:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const messageText = input.trim();
    setInput("");

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sessionId,
      sender: "USER",
      message: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "USER",
          message: messageText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Replace temp message with actual data from db
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data : m)));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Authenticity Concierge support chat"
          >
            <FiMessageSquare size={24} />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="w-80 md:w-96 h-[450px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Support Concierge</h3>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Active
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-500 mt-10">
                  Welcome to Support. Send a message to start syncing with our agents!
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                        m.sender === "USER"
                          ? "bg-yellow-400 text-black rounded-tr-none"
                          : "bg-slate-800 text-white rounded-tl-none"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-yellow-400/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none placeholder-slate-500"
              />
              <button
                type="submit"
                className="w-9 h-9 bg-yellow-400 text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <FiSend size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
