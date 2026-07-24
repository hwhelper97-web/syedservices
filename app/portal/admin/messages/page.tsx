"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare, FiUser, FiLoader, FiRefreshCw, FiSearch } from "react-icons/fi";

export default function AdminMessagesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        // filter clients and agents
        const chatUsers = data.users.filter((u: any) => u.role === "CLIENT" || u.role === "AGENT");
        setClients(chatUsers);
      }
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setLoadingClients(false);
    }
  };

  const selectClient = async (client: any) => {
    setSelectedClient(client);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/messages?partnerId=${client.id}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const refreshMessages = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/messages?partnerId=${selectedClient.id}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to refresh messages", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedClient) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedClient.id,
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

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex bg-[#0f172a] border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />

      {/* Left Sidebar: Portal Chats List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/20 relative z-10 shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Portal Chats</h4>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search clients or agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs placeholder-slate-650 focus:outline-none text-white font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingClients ? (
            <div className="flex justify-center items-center h-32 text-yellow-400">
              <FiLoader className="animate-spin" size={20} />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No chat users found</div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              const initials = client.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    isSelected ? "bg-black/10 border-black/20 text-black" : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                  }`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-black" : "text-white"}`}>
                        {client.name}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        client.role === "AGENT"
                          ? (isSelected ? "bg-black/20 text-black border border-black/15" : "bg-blue-500/20 text-blue-400 border border-blue-555/20")
                          : (isSelected ? "bg-black/10 text-black border border-black/10" : "bg-emerald-500/20 text-emerald-400 border border-emerald-555/20")
                      }`}>
                        {client.role === "AGENT" ? "Agent" : "Client"}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate ${isSelected ? "text-black/60" : "text-slate-500"}`}>
                      {client.email}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side: Chat Container */}
      <div className="flex-1 flex flex-col relative z-10">
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center font-bold border border-yellow-400/20">
                  {selectedClient.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{selectedClient.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={refreshMessages}
                className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col justify-end">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full text-yellow-400">
                  <FiLoader className="animate-spin" size={28} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-3 my-auto">
                  <FiMessageSquare className="text-slate-500 text-4xl mx-auto" />
                  <div>
                    <h5 className="text-white font-bold">No messages yet</h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Send a message to start the conversation with {selectedClient.name}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-full pr-1">
                  {messages.map((msg) => {
                    const isSelf = msg.senderId !== selectedClient.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                          isSelf
                            ? "bg-slate-800 text-slate-300 border border-slate-700"
                            : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                        }`}>
                          {isSelf ? "AD" : selectedClient.name[0].toUpperCase()}
                        </div>
                        <div className={`p-4 rounded-3xl text-sm ${
                          isSelf
                            ? "bg-yellow-400 text-black font-semibold rounded-tr-none"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.messageText}</p>
                          <span className={`block text-[9px] mt-1.5 text-right ${
                            isSelf ? "text-black/50" : "text-slate-500"
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

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-slate-800 bg-slate-900/20">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${selectedClient.name}...`}
                  className="flex-1 px-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm placeholder-slate-650 focus:outline-none text-white font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-6 py-3.5 bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-transform text-black font-black rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-50"
                >
                  {sending ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 bg-slate-900/60 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center shadow-lg">
              <FiMessageSquare size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Select a conversation</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Choose a client from the sidebar chat list to view history and start sending messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
