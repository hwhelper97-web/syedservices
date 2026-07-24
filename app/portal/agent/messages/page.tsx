"use client";

import { useState, useEffect } from "react";
import { FiSend, FiLoader, FiMessageSquare, FiUser } from "react-icons/fi";

export default function AgentMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent("");
        fetchMessages();
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
      <div>
        <h3 className="text-xl font-black text-white tracking-tight">Internal Agency Chat</h3>
        <p className="text-xs text-slate-400 mt-1">Communicate directly with Syed Services headquarters and staff</p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[500px]">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
              <FiMessageSquare size={32} />
              <p className="text-xs">No message logs. Send a message to start a conversation thread.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <FiUser size={10} />
                  <span className="font-bold">{msg.sender.name}</span>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 max-w-xl self-start">
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm focus:outline-none text-white"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
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
