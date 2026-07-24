"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMenu, FiX, FiHome, FiFileText, FiUsers, FiGlobe, 
  FiDollarSign, FiCalendar, FiMessageSquare, FiSettings, 
  FiLogOut, FiBriefcase, FiCheckSquare, FiPlusCircle, FiUser 
} from "react-icons/fi";
import Logo from "@/components/Logo";

interface PortalLayoutClientProps {
  children: React.ReactNode;
  user: {
    userId: number;
    email: string;
    role: string;
    name: string;
  };
}

export default function PortalLayoutClient({ children, user }: PortalLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/portal/login");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Define links based on user role
  const getSidebarLinks = () => {
    const role = user.role;
    
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      return [
        { name: "Dashboard", href: "/portal/admin", icon: <FiHome size={18} /> },
        { name: "Applications", href: "/portal/admin/applications", icon: <FiFileText size={18} /> },
        { name: "Client Database", href: "/portal/admin/clients", icon: <FiUsers size={18} /> },
        { name: "Visa Settings", href: "/portal/admin/settings", icon: <FiGlobe size={18} /> },
        { name: "Invoices & Payments", href: "/portal/admin/payments", icon: <FiDollarSign size={18} /> },
        { name: "User Management", href: "/portal/admin/users", icon: <FiSettings size={18} /> },
      ];
    }
        if (role === "AGENT") {
      return [
        { name: "Dashboard", href: "/portal/agent", icon: <FiHome size={18} /> },
        { name: "Submit Application", href: "/portal/agent/new-app", icon: <FiPlusCircle size={18} /> },
        { name: "My Applications", href: "/portal/agent/applications", icon: <FiFileText size={18} /> },
        { name: "Chat Advisor", href: "/portal/agent/messages", icon: <FiMessageSquare size={18} /> },
        { name: "Commission Logs", href: "/portal/agent/payments", icon: <FiDollarSign size={18} /> },
        { name: "My Profile", href: "/portal/agent/profile", icon: <FiUser size={18} /> },
      ];
    }

    if (role === "STAFF") {
      return [
        { name: "Dashboard", href: "/portal/staff", icon: <FiHome size={18} /> },
        { name: "Assigned Tasks", href: "/portal/staff/tasks", icon: <FiCheckSquare size={18} /> },
        { name: "Applications", href: "/portal/staff/applications", icon: <FiFileText size={18} /> },
        { name: "Client Messages", href: "/portal/staff/messages", icon: <FiMessageSquare size={18} /> },
      ];
    }

    // Default: CLIENT
    return [
      { name: "Dashboard", href: "/portal/client", icon: <FiHome size={18} /> },
      { name: "Apply for Visa", href: "/portal/client/apply", icon: <FiPlusCircle size={18} /> },
      { name: "My Documents", href: "/portal/client/documents", icon: <FiFileText size={18} /> },
      { name: "Payments & Fees", href: "/portal/client/billing", icon: <FiDollarSign size={18} /> },
      { name: "Book Appointment", href: "/portal/client/appointments", icon: <FiCalendar size={18} /> },
      { name: "Support Messages", href: "/portal/client/messages", icon: <FiMessageSquare size={18} /> },
    ];
  };

  const links = getSidebarLinks();

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-center">
          <Logo />
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${isActive ? "bg-yellow-400 text-black hover:bg-yellow-400 hover:text-black shadow-lg shadow-yellow-400/10" : "text-slate-400"}`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center font-bold border border-yellow-400/20">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/20 text-red-400 text-xs font-black rounded-xl hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] border-r border-slate-800 z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <Logo />
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isActive ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10" : "text-slate-400 hover:bg-slate-800"}`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/20 text-red-400 text-xs font-black rounded-xl hover:bg-red-500/10 transition-all"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <FiMenu size={18} />
            </button>
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden md:block">
              {pathname.split("/").slice(2).join(" / ") || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick user badge */}
            <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {user.role} mode
              </span>
            </div>
          </div>
        </header>

        {/* Content Page */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
