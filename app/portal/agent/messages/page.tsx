"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend, FiLoader, FiMessageSquare, FiRefreshCw, FiCheck, FiBriefcase, FiVolume2 } from "react-icons/fi";
import { playNotificationSound } from "@/utils/notificationSound";

export default function AgentMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef<number>(0);
  const currentUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    fetchSessionAndMessages();

    // Auto-poll messages every 3 seconds
    const interval = setInterval(() => {
      pollMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessionAndMessages = async () => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionRes.ok && sessionData.session) {
        setCurrentUserId(sessionData.session.userId);
        currentUserIdRef.current = sessionData.session.userId;
      }

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
        const loaded = data.messages || [];
        setMessages(loaded);
        lastCountRef.current = loaded.length;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pollMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (res.ok) {
        const incoming: any[] = data.messages || [];

        if (incoming.length > lastCountRef.current && lastCountRef.current > 0) {
          const latest = incoming[incoming.length - 1];
          if (latest.senderId !== currentUserIdRef.current) {
            playNotificationSound();
          }
        }
        lastCountRef.current = incoming.length;
        setMessages(incoming);
      }
    } catch (e) {
      console.error("Polling agent messages error:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const text = content.trim();
    setContent("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        lastCountRef.current += 1;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-yellow-400 space-y-2">
        <FiLoader className="animate-spin" size={32} />
        <span className="text-xs text-slate-400">Connecting to agency chat...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-[#0f172a] p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <FiBriefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">Agent Communications</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct operational line to Syed Services headquarters and management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playNotificationSound()}
            title="Test notification chime sound"
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 rounded-xl transition-all cursor-pointer"
          >
            <FiVolume2 size={16} />
          </button>
          <button
            onClick={fetchMessages}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Refresh messages"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[550px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 flex flex-col justify-end">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500 my-auto">
              <FiMessageSquare size={32} />
              <p className="text-xs">No messages yet. Send a message to headquarters.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-full pr-1">
              {messages.map((msg) => {
                const isSelf = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      isSelf ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black ${
                        isSelf
                          ? "bg-slate-800 text-slate-300 border border-slate-700"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {isSelf ? "AG" : "HQ"}
                    </div>

                    <div
                      className={`p-4 rounded-3xl text-sm leading-relaxed ${
                        isSelf
                          ? "bg-yellow-400 text-black font-semibold rounded-tr-none shadow-md shadow-yellow-400/5"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-sans">{msg.messageText || msg.content}</p>
                      <div
                        className={`flex items-center justify-end gap-1.5 text-[9px] mt-1.5 ${
                          isSelf ? "text-black/60 font-medium" : "text-slate-500"
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isSelf && <FiCheck size={11} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="flex gap-3 border-t border-slate-800 pt-4 bg-slate-900/10 relative z-10"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message to headquarters... (Press Enter)"
            className="flex-1 px-4 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm focus:outline-none text-white placeholder-slate-500 font-medium"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-6 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/10"
          >
            {sending ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
