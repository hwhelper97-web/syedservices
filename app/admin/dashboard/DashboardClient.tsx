"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiInbox,
  FiShoppingBag,
  FiMessageSquare,
  FiMail,
  FiLogOut,
  FiSliders,
  FiSend,
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardClient({ initialTab = "orders" }: { initialTab?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab); // orders, appraisals, chat, emails
  const [isMounted, setIsMounted] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<{ [key: string]: any[] }>({});
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Fetch flags
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAppraisals, setLoadingAppraisals] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authenticate admin session
  useEffect(() => {
    setIsMounted(true);
    // Simple local check for authentication bypass/redirect if not logged in
    const token = localStorage.getItem("token");
    const adminFlag = localStorage.getItem("admin");
    
    // In dev / test, if no admin, set default email or redirect
    if (adminFlag !== "true" || !token) {
      router.push("/admin/login");
    } else {
      setAdminEmail("syedsaif@syedservices.com.pk");
    }
  }, [router]);

  // Fetch active tab data
  useEffect(() => {
    if (!isMounted) return;
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "appraisals") fetchAppraisals();
    if (activeTab === "chat") fetchChatSessions();
    if (activeTab === "emails") fetchEmails();
  }, [activeTab, isMounted]);

  // Chat polling
  useEffect(() => {
    if (activeTab !== "chat" || !selectedSessionId) return;
    const interval = setInterval(() => {
      fetchChatSessionMessages(selectedSessionId);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedSessionId]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  // 1. ORDERS METHODS
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (id: number, currentStatus: string) => {
    // Transition through statuses: Pending Inspection -> Authenticated -> Shipped
    const nextStatus = currentStatus === "Pending Inspection" ? "Authenticated" : "Shipped";
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. APPRAISALS METHODS
  const fetchAppraisals = async () => {
    setLoadingAppraisals(true);
    try {
      const res = await fetch("/api/sell");
      if (res.ok) {
        setAppraisals(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppraisals(false);
    }
  };

  const handleUpdateAppraisal = async (id: number, currentStatus: string, score: number, box: string) => {
    const nextStatus = currentStatus === "Pending Appraisal" ? "Completed" : "Pending Appraisal";
    try {
      const res = await fetch(`/api/sell/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          conditionScore: score,
          boxStatus: box,
        }),
      });
      if (res.ok) {
        setAppraisals(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus, conditionScore: score, boxStatus: box } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. CHAT METHODS
  const fetchChatSessions = async () => {
    setLoadingChat(true);
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const allMsgs: any[] = await res.json();
        // Group messages by sessionId
        const sessions: { [key: string]: any[] } = {};
        allMsgs.forEach(m => {
          if (!sessions[m.sessionId]) {
            sessions[m.sessionId] = [];
          }
          sessions[m.sessionId].push(m);
        });
        setChatSessions(sessions);
        if (Object.keys(sessions).length > 0 && !selectedSessionId) {
          setSelectedSessionId(Object.keys(sessions)[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const fetchChatSessionMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${sid}`);
      if (res.ok) {
        const msgs = await res.json();
        setChatSessions(prev => ({
          ...prev,
          [sid]: msgs
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSessionId) return;

    const msgText = chatInput.trim();
    setChatInput("");

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sessionId: selectedSessionId,
      sender: "ADMIN",
      message: msgText,
      createdAt: new Date().toISOString()
    };

    setChatSessions(prev => ({
      ...prev,
      [selectedSessionId]: [...(prev[selectedSessionId] || []), tempMsg]
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          sender: "ADMIN",
          message: msgText
        })
      });
      if (res.ok) {
        const actualMsg = await res.json();
        setChatSessions(prev => ({
          ...prev,
          [selectedSessionId]: (prev[selectedSessionId] || []).map(m => m.id === tempMsg.id ? actualMsg : m)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. EMAILS METHODS
  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        setEmailLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmails(false);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSessions, selectedSessionId]);

  if (!isMounted) return null;

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Header Title */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl text-black font-black flex items-center justify-center text-lg shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              SH
            </div>
            <div>
              <h2 className="text-white font-black text-sm tracking-tight">SneakerHub</h2>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Console</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-2">
            {[
              { id: "orders", label: "Orders Queue", icon: FiShoppingBag },
              { id: "appraisals", label: "Seller Appraisals", icon: FiSliders },
              { id: "chat", label: "Support Chat", icon: FiMessageSquare },
              { id: "emails", label: "Sent Emails Log", icon: FiMail },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/5"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Profile Block */}
        <div className="mt-8 pt-6 border-t border-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-yellow-400">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-white font-bold truncate">Saeed Arman</p>
              <p className="text-[8px] text-slate-500 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 border border-slate-800 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiLogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Console window */}
      <main className="flex-1 p-6 md:p-10 flex flex-col relative overflow-x-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="mb-8 flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-black text-white capitalize tracking-tight">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System monitoring panel & operation actions
            </p>
          </div>
          <button
            onClick={() => {
              if (activeTab === "orders") fetchOrders();
              if (activeTab === "appraisals") fetchAppraisals();
              if (activeTab === "chat") fetchChatSessions();
              if (activeTab === "emails") fetchEmails();
            }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <FiRefreshCw size={14} />
          </button>
        </header>

        {/* Tab View Switcher */}
        <section className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-[2rem] p-6 shadow-2xl backdrop-blur-md relative z-10 flex flex-col">
          {/* TAB 1: ORDERS QUEUE */}
          {activeTab === "orders" && (
            <div className="space-y-6 flex-1 flex flex-col">
              {loadingOrders ? (
                <div className="flex-1 flex items-center justify-center">
                  <FiLoader className="animate-spin text-yellow-400" size={32} />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-xs">
                  <FiShoppingBag size={48} className="mb-4 text-slate-700" />
                  No order entries found in database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-350">
                    <thead className="bg-slate-900/40 text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Tracking ID</th>
                        <th className="p-4">Sneaker</th>
                        <th className="p-4">Customer Email</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-medium">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 font-bold text-yellow-400">{o.trackingId}</td>
                          <td className="p-4 text-white font-bold">{o.sneakerName}</td>
                          <td className="p-4">{o.customerEmail}</td>
                          <td className="p-4">${o.price}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                o.status === "Pending Inspection"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : o.status === "Authenticated"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {o.status !== "Shipped" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                                className="px-3 py-1.5 bg-yellow-400 text-black rounded-lg text-[10px] font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                              >
                                {o.status === "Pending Inspection" ? "Verify / Authenticate" : "Ship Order"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SELLER APPRAISALS */}
          {activeTab === "appraisals" && (
            <div className="space-y-6 flex-1 flex flex-col">
              {loadingAppraisals ? (
                <div className="flex-1 flex items-center justify-center">
                  <FiLoader className="animate-spin text-yellow-400" size={32} />
                </div>
              ) : appraisals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-xs">
                  <FiSliders size={48} className="mb-4 text-slate-700" />
                  No appraisals submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-350">
                    <thead className="bg-slate-900/40 text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Sneaker</th>
                        <th className="p-4">Condition</th>
                        <th className="p-4">Box Status</th>
                        <th className="p-4">Seller Email</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-medium">
                      {appraisals.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 text-slate-500">#{a.id}</td>
                          <td className="p-4 text-white font-bold">{a.sneakerName}</td>
                          <td className="p-4">
                            <span className="text-yellow-400 font-bold">{a.conditionScore}</span>/10
                          </td>
                          <td className="p-4">{a.boxStatus}</td>
                          <td className="p-4">{a.sellerEmail}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                a.status === "Pending Appraisal"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            {a.status === "Pending Appraisal" && (
                              <>
                                <button
                                  onClick={() => handleUpdateAppraisal(a.id, a.status, a.conditionScore, "Damaged")}
                                  className="px-2.5 py-1.5 border border-slate-800 text-slate-400 rounded-lg text-[9px] font-bold hover:text-white transition-colors cursor-pointer"
                                  title="Mark box damaged"
                                >
                                  Damage Box
                                </button>
                                <button
                                  onClick={() => handleUpdateAppraisal(a.id, a.status, 9, a.boxStatus)}
                                  className="px-2.5 py-1.5 border border-slate-800 text-slate-400 rounded-lg text-[9px] font-bold hover:text-white transition-colors cursor-pointer"
                                  title="Degrade Condition"
                                >
                                  Degrade (9/10)
                                </button>
                                <button
                                  onClick={() => handleUpdateAppraisal(a.id, a.status, a.conditionScore, a.boxStatus)}
                                  className="px-3 py-1.5 bg-yellow-400 text-black rounded-lg text-[10px] font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                >
                                  Complete Appraisal
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORT CHAT */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[350px]">
              {loadingChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <FiLoader className="animate-spin text-yellow-400" size={32} />
                </div>
              ) : Object.keys(chatSessions).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-xs">
                  <FiMessageSquare size={48} className="mb-4 text-slate-700" />
                  No customer chat sessions available.
                </div>
              ) : (
                <>
                  {/* Sessions sidebar */}
                  <div className="w-full md:w-64 border-r border-slate-800/60 pr-0 md:pr-6 flex flex-col gap-2 overflow-y-auto max-h-[350px]">
                    <h4 className="text-[10px] text-slate-550 font-bold uppercase tracking-widest mb-2 px-2">Active Dialogs</h4>
                    {Object.keys(chatSessions).map((sid) => {
                      const msgs = chatSessions[sid];
                      const lastMsg = msgs[msgs.length - 1];
                      return (
                        <button
                          key={sid}
                          onClick={() => setSelectedSessionId(sid)}
                          className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${
                            selectedSessionId === sid
                              ? "bg-slate-900 text-white border border-slate-850"
                              : "text-slate-450 hover:bg-slate-900/40 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs">Guest {sid.substring(8, 12)}</span>
                            <span className="text-[8px] text-slate-600">
                              {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate leading-relaxed">
                            {lastMsg ? lastMsg.message : "Empty chat"}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active session dialog window */}
                  <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-850 rounded-[1.5rem] overflow-hidden">
                    {selectedSessionId ? (
                      <>
                        {/* Conversation messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[250px]">
                          {(chatSessions[selectedSessionId] || []).map((m) => (
                            <div
                              key={m.id}
                              className={`flex ${m.sender === "ADMIN" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                                  m.sender === "ADMIN"
                                    ? "bg-yellow-400 text-black rounded-tr-none"
                                    : "bg-slate-900 text-white border border-slate-800 rounded-tl-none"
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input submit form */}
                        <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2">
                          <input
                            type="text"
                            placeholder="Type reply as Administrator..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-yellow-400/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none placeholder-slate-550"
                          />
                          <button
                            type="submit"
                            className="w-9 h-9 bg-yellow-400 text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                          >
                            <FiSend size={14} />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                        Select a dialog to view conversations.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: SENT EMAILS LOG */}
          {activeTab === "emails" && (
            <div className="space-y-6 flex-1 flex flex-col">
              {loadingEmails ? (
                <div className="flex-1 flex items-center justify-center">
                  <FiLoader className="animate-spin text-yellow-400" size={32} />
                </div>
              ) : emailLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-xs">
                  <FiMail size={48} className="mb-4 text-slate-700" />
                  No sent logs stored in queue.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {emailLogs.map((log) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={log.id}
                      className="bg-slate-950 border border-slate-850 p-5 rounded-[1.5rem] space-y-2 relative"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-2 font-bold uppercase tracking-wider">
                        <span>Recipient: <strong className="text-yellow-400">{log.to}</strong></span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <h4 className="text-white text-xs font-black tracking-tight">{log.subject}</h4>
                      <p className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed pt-1">
                        {log.body}
                      </p>
                      <span className="absolute bottom-4 right-4 text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-green-500/10">
                        Sent Log Verified
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
