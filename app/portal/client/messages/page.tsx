"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare, FiUser, FiLoader, FiRefreshCw } from "react-icons/fi";

export default function ClientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seeded admin ID is 1 (Saeed Arman)
  const ADMIN_ID = 1;

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?partnerId=${ADMIN_ID}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: ADMIN_ID,
          messageText: inputText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputText("");
      }
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-[#0f172a] border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />

      {/* Chat Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center font-bold border border-yellow-400/20">
            SA
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Saeed Arman</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Support Advisor</p>
          </div>
        </div>
        <button 
          onClick={fetchMessages} 
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <FiRefreshCw size={16} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 relative z-10 flex flex-col justify-end">
        {loading ? (
          <div className="flex justify-center items-center h-full text-yellow-400">
            <FiLoader className="animate-spin" size={28} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-3 my-auto">
            <FiMessageSquare className="text-slate-500 text-4xl mx-auto" />
            <h4 className="text-white font-bold text-sm">No Messages Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Start the conversation by sending your queries regarding your visa or tickets here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 max-h-full">
            {messages.map((msg) => {
              // Seeded admin ID is 1, so if senderId === 1, it's incoming
              const isIncoming = msg.senderId === ADMIN_ID;
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-3xl text-sm ${
                    isIncoming 
                      ? "bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none" 
                      : "bg-yellow-400 text-black font-medium rounded-tr-none shadow-lg shadow-yellow-400/5"
                  }`}>
                    <p>{msg.messageText}</p>
                    <span className={`text-[8px] block mt-1.5 text-right ${isIncoming ? "text-slate-550" : "text-black/60"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-6 border-t border-slate-800 bg-slate-900/20 relative z-10">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your query here..."
            className="w-full pl-6 pr-16 py-4 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm focus:outline-none placeholder-slate-600"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="absolute right-2 top-2 p-3 bg-yellow-400 text-black rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
