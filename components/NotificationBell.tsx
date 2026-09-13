"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiMessageSquare, FiFileText, FiAlertCircle, FiVolume2 } from "react-icons/fi";
import Link from "next/link";
import { playNotificationSound } from "@/utils/notificationSound";

interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  actionUrl: string | null;
  category: string | null;
  priority: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id?: number) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : { markAll: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("Failed to mark notifications read", e);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "MESSAGE":
        return <FiMessageSquare className="text-yellow-400" size={14} />;
      case "DOCUMENT":
        return <FiFileText className="text-emerald-400" size={14} />;
      case "CONTRACT":
        return <FiCheckCircle className="text-blue-400" size={14} />;
      case "PIPELINE":
        return <FiAlertCircle className="text-amber-400" size={14} />;
      default:
        return <FiBell className="text-yellow-400" size={14} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Also unlock audio context on click
          playNotificationSound();
        }}
        className="relative p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer flex items-center justify-center"
        title="Notifications & Sound"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => playNotificationSound()}
                title="Test notification sound chime"
                className="p-1.5 text-slate-400 hover:text-yellow-400 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              >
                <FiVolume2 size={13} />
                <span className="text-[10px]">Test Sound</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead()}
                  className="text-[10px] font-bold text-slate-400 hover:text-yellow-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors ${
                    notif.isRead ? "bg-transparent opacity-75" : "bg-yellow-400/5"
                  } hover:bg-slate-900/60 flex items-start gap-3`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-white truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[9px] text-slate-500 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="text-[10px] font-bold text-yellow-400 hover:underline"
                        >
                          View details →
                        </Link>
                      ) : (
                        <span />
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[9px] text-slate-500 hover:text-slate-300"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
