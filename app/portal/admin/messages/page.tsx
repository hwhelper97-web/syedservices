"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiUser,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiCheck,
  FiPhone,
  FiMail,
  FiClock,
  FiVolume2
} from "react-icons/fi";
import { playNotificationSound } from "@/utils/notificationSound";

interface Conversation {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    details: string | null;
  };
  lastMessage: {
    id: number;
    messageText: string;
    createdAt: string;
    senderId: number;
    isRead: boolean;
  } | null;
  unreadCount: number;
  messageCount: number;
  lastActivity: string;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation["user"] | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedUserRef = useRef<Conversation["user"] | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Keep ref updated for intervals
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initial load
  useEffect(() => {
    fetchSession();
    fetchConversations(true);

    // Auto-poll conversations and active chat every 3 seconds for live messaging
    const interval = setInterval(() => {
      fetchConversations(false);
      if (selectedUserRef.current) {
        pollActiveChat(selectedUserRef.current.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setCurrentAdminId(data.session.userId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConversations = async (isInitial = false) => {
    try {
      if (isInitial) setLoadingConversations(true);
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      if (isInitial) setLoadingConversations(false);
    }
  };

  const pollActiveChat = async (partnerId: number) => {
    try {
      const res = await fetch(`/api/messages?partnerId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        const incoming: any[] = data.messages || [];

        // Check if new message received
        if (incoming.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
          const latest = incoming[incoming.length - 1];
          if (latest.senderId === partnerId) {
            playNotificationSound();
            // Automatically mark read since conversation is open
            markConversationRead(partnerId);
          }
        }
        lastMessageCountRef.current = incoming.length;
        setMessages(incoming);
      }
    } catch (e) {
      console.error("Polling active chat error", e);
    }
  };

  const selectPartner = async (partnerUser: Conversation["user"]) => {
    setSelectedUser(partnerUser);
    setLoadingMessages(true);
    setMessages([]);
    lastMessageCountRef.current = 0;

    try {
      // Mark read in background
      markConversationRead(partnerUser.id);

      const res = await fetch(`/api/messages?partnerId=${partnerUser.id}`);
      if (res.ok) {
        const data = await res.json();
        const loadedMsgs = data.messages || [];
        setMessages(loadedMsgs);
        lastMessageCountRef.current = loadedMsgs.length;
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markConversationRead = async (partnerId: number) => {
    try {
      await fetch("/api/messages/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });

      // Update locally
      setConversations((prev) =>
        prev.map((c) =>
          c.user.id === partnerId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (e) {
      console.error("Mark read error", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          messageText: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        lastMessageCountRef.current += 1;

        // Update conversation summary locally
        setConversations((prev) =>
          prev.map((c) =>
            c.user.id === selectedUser.id
              ? {
                  ...c,
                  lastMessage: data.message,
                  lastActivity: new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user.phone && c.user.phone.includes(searchTerm))
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[120px] pointer-events-none" />

      {/* Left Sidebar: Conversations List */}
      <div className="w-80 md:w-96 border-r border-slate-800 flex flex-col bg-slate-950/40 relative z-10 shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-black text-sm uppercase tracking-wider">
                Support Chats
              </h4>
              <span className="text-[10px] font-bold bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/20">
                Live
              </span>
            </div>
            <button
              onClick={() => fetchConversations(true)}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh conversation list"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search clients or agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 text-white font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex flex-col items-center justify-center h-48 text-yellow-400 space-y-2">
              <FiLoader className="animate-spin" size={24} />
              <span className="text-xs text-slate-400">Loading chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 space-y-2">
              <FiMessageSquare className="mx-auto text-2xl text-slate-600" />
              <p>No chat partners found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedUser?.id === conv.user.id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <button
                  key={conv.user.id}
                  onClick={() => selectPartner(conv.user)}
                  className={`w-full p-3 rounded-2xl flex items-start gap-3 transition-all text-left cursor-pointer relative ${
                    isSelected
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10 font-medium"
                      : hasUnread
                      ? "bg-slate-900/90 border border-yellow-400/30 text-white"
                      : "hover:bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border ${
                        isSelected
                          ? "bg-black/10 border-black/20 text-black"
                          : hasUnread
                          ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      {getInitials(conv.user.name)}
                    </div>
                    {hasUnread && !isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black font-black text-[9px] rounded-full flex items-center justify-center border-2 border-[#0f172a] animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-black" : hasUnread ? "text-white font-extrabold" : "text-white"
                        }`}
                      >
                        {conv.user.name}
                      </p>
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          conv.user.role === "AGENT"
                            ? isSelected
                              ? "bg-black/20 text-black"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                            : isSelected
                            ? "bg-black/10 text-black"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {conv.user.role === "AGENT" ? "Agent" : "Client"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-1">
                      <p
                        className={`text-[11px] truncate ${
                          isSelected
                            ? "text-black/70"
                            : hasUnread
                            ? "text-yellow-300 font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {conv.lastMessage
                          ? conv.lastMessage.messageText
                          : "Start conversation..."}
                      </p>
                      {conv.lastMessage && (
                        <span
                          className={`text-[9px] shrink-0 font-medium ${
                            isSelected ? "text-black/60" : "text-slate-500"
                          }`}
                        >
                          {formatTimeAgo(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side: Active Chat Container */}
      <div className="flex-1 flex flex-col relative z-10">
        {selectedUser ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-black text-sm border border-yellow-400/20 shadow-inner">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-extrabold text-sm">{selectedUser.name}</h4>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        selectedUser.role === "AGENT"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <FiMail size={11} /> {selectedUser.email}
                    </span>
                    {selectedUser.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <FiPhone size={11} /> {selectedUser.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playNotificationSound()}
                  title="Test Sound"
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 rounded-xl transition-all cursor-pointer"
                >
                  <FiVolume2 size={16} />
                </button>
                <button
                  onClick={() => pollActiveChat(selectedUser.id)}
                  title="Refresh chat messages"
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <FiRefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col justify-end">
              {loadingMessages ? (
                <div className="flex flex-col justify-center items-center h-full text-yellow-400 space-y-2">
                  <FiLoader className="animate-spin" size={28} />
                  <span className="text-xs text-slate-400">Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-3 my-auto">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 text-slate-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <FiMessageSquare size={24} />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">No messages yet</h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Type below to send the first message to {selectedUser.name}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-full pr-1">
                  {messages.map((msg) => {
                    const isSelf = msg.senderId !== selectedUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[82%] ${
                          isSelf ? "ml-auto flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black ${
                            isSelf
                              ? "bg-slate-800 text-yellow-400 border border-slate-700"
                              : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                          }`}
                        >
                          {isSelf ? "AD" : getInitials(selectedUser.name)}
                        </div>
                        <div
                          className={`p-4 rounded-3xl text-sm ${
                            isSelf
                              ? "bg-yellow-400 text-black font-semibold rounded-tr-none shadow-lg shadow-yellow-400/5"
                              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.messageText || msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1.5 text-[9px] mt-1.5 ${
                              isSelf ? "text-black/60 font-medium" : "text-slate-500 font-mono"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isSelf && (
                              <FiCheck size={11} className={msg.isRead ? "text-black" : "text-black/50"} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/30"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${selectedUser.name}... (Press Enter)`}
                  className="flex-1 px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 text-white font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all text-black font-black rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <FiLoader className="animate-spin" size={18} />
                  ) : (
                    <FiSend size={18} />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-slate-900/80 border border-slate-800 text-yellow-400 rounded-3xl flex items-center justify-center shadow-xl">
              <FiMessageSquare size={32} />
            </div>
            <div>
              <h4 className="text-white font-black text-lg">Select a conversation</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Choose a client or agent from the left sidebar to view message history, read incoming inquiries, and respond in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
