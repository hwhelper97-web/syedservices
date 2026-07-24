"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend, FiLoader, FiMessageSquare, FiRefreshCw } from "react-icons/fi";

export default function ClientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessionAndMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessionAndMessages = async () => {
    try {
      // Fetch session
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionRes.ok && sessionData.session) {
        setCurrentUserId(sessionData.session.userId);
      }

      // Fetch messages
      await fetchMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: content }),
      });
      if (res.ok) {
        setContent("");
        await fetchMessages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Support Messages</h3>
          <p className="text-xs text-slate-400 mt-1">Chat directly with our support team regarding your applications</p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Refresh messages"
        >
          <FiRefreshCw size={16} />
        </button>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[550px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 flex flex-col justify-start">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500 my-auto">
              <FiMessageSquare size={32} />
              <p className="text-xs">No support messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSelf = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      isSelf
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                    }`}>
                      {isSelf ? "ME" : msg.sender?.name?.[0]?.toUpperCase() || "S"}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isSelf
                        ? "bg-yellow-400 text-black font-semibold rounded-tr-none shadow-md shadow-yellow-400/5"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.messageText}</p>
                      <span className={`block text-[9px] mt-1.5 text-right ${
                        isSelf ? "text-black/60" : "text-slate-500"
                      }`}>
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

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-slate-800 pt-4 bg-slate-900/10 relative z-10">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message to Syed Services support..."
            className="flex-1 px-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm focus:outline-none text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-6 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/10"
          >
            {sending ? (
              <FiLoader className="animate-spin" size={16} />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
