"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare, FiSend, FiLoader, FiSearch,
  FiRefreshCw, FiUser
} from "react-icons/fi";

export default function StaffMessagesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setClients(data.users.filter((u: any) => u.role === "CLIENT"));
      }
    } catch (e) { console.error(e); }
    finally { setLoadingClients(false); }
  };

  const selectClient = async (client: any) => {
    setSelectedClient(client);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/messages?partnerId=${client.id}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch (e) { console.error(e); }
    finally { setLoadingMessages(false); }
  };

  const refreshMessages = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/messages?partnerId=${selectedClient.id}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedClient) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedClient.id, messageText: inputText }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setInputText("");
      }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initials = (name: string) =>
    name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex bg-[#0f172a] border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />

      {/* ── Sidebar: Client List ── */}
      <div className="w-72 border-r border-slate-800 flex flex-col bg-slate-950/30 relative z-10 shrink-0">
        <div className="p-5 border-b border-slate-800 space-y-3">
          <h4 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <FiMessageSquare size={16} className="text-yellow-400" /> Client Messages
          </h4>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <FiSearch size={13} />
            </span>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs placeholder-slate-600 focus:outline-none text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingClients ? (
            <div className="flex justify-center items-center h-32 text-yellow-400">
              <FiLoader className="animate-spin" size={20} />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-600">No clients found</div>
          ) : (
            filteredClients.map(client => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                      : "hover:bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                    isSelected ? "bg-black/10 border-black/20 text-black" : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                  }`}>
                    {initials(client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-black" : "text-white"}`}>{client.name}</p>
                    <p className={`text-[10px] truncate ${isSelected ? "text-black/60" : "text-slate-500"}`}>{client.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center font-bold border border-yellow-400/20 text-sm">
                  {initials(selectedClient.name)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{selectedClient.name}</h4>
                  <p className="text-[10px] text-slate-500">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={refreshMessages}
                className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Refresh messages"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full text-yellow-400">
                  <FiLoader className="animate-spin" size={28} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <FiMessageSquare className="text-slate-600 text-4xl" />
                  <div>
                    <h5 className="text-white font-bold text-sm">No messages yet</h5>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Send a message to start chatting with {selectedClient.name}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => {
                    const isSelf = msg.senderId !== selectedClient.id;
                    return (
                      <div key={msg.id || i} className={`flex gap-3 ${isSelf ? "flex-row-reverse" : ""} max-w-[80%] ${isSelf ? "ml-auto" : ""}`}>
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                          isSelf
                            ? "bg-slate-800 text-slate-300 border border-slate-700"
                            : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                        }`}>
                          {isSelf ? "ME" : initials(selectedClient.name)}
                        </div>
                        <div className={`px-4 py-3 rounded-3xl text-sm max-w-sm ${
                          isSelf
                            ? "bg-yellow-400 text-black font-semibold rounded-tr-none"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.messageText}</p>
                          <span className={`block text-[9px] mt-1 text-right ${isSelf ? "text-black/50" : "text-slate-600"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-5 border-t border-slate-800 bg-slate-900/10 shrink-0">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${selectedClient.name}...`}
                  className="flex-1 px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm placeholder-slate-600 focus:outline-none text-white focus:border-yellow-400/40"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-5 py-3 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-50"
                >
                  {sending ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-600 rounded-full flex items-center justify-center">
              <FiMessageSquare size={26} />
            </div>
            <div>
              <h4 className="text-white font-bold">Select a Client</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Choose a client from the sidebar to view and send messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
