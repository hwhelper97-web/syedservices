"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiMessageSquare,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiArrowRight,
  FiVolume2
} from "react-icons/fi";
import Link from "next/link";
import { playNotificationSound } from "@/utils/notificationSound";

export interface LiveNotification {
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

export default function LiveNotificationListener() {
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const initialFetchDone = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Check notifications periodically
    const pollNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.notifications)) {
          const notifs: LiveNotification[] = data.notifications;

          if (!initialFetchDone.current) {
            // First run: populate known IDs without sound blast
            notifs.forEach((n) => seenIdsRef.current.add(n.id));
            initialFetchDone.current = true;
            return;
          }

          // Find brand new unread notifications that we haven't seen yet
          const brandNew = notifs.filter(
            (n) => !n.isRead && !seenIdsRef.current.has(n.id)
          );

          if (brandNew.length > 0 && isMounted) {
            // Register as seen
            brandNew.forEach((n) => seenIdsRef.current.add(n.id));

            // Take the most recent one to display
            const latest = brandNew[0];
            setActiveToast(latest);

            // Play the chime sound!
            playNotificationSound();

            // Auto dismiss toast after 8s
            setTimeout(() => {
              setActiveToast((cur) => (cur?.id === latest.id ? null : cur));
            }, 8000);
          }
        }
      } catch (err) {
        console.debug("Error polling live notifications:", err);
      }
    };

    // Initial check
    pollNotifications();

    // Poll every 4 seconds
    const interval = setInterval(pollNotifications, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "MESSAGE":
        return <FiMessageSquare className="text-yellow-400" size={18} />;
      case "DOCUMENT":
        return <FiFileText className="text-emerald-400" size={18} />;
      case "CONTRACT":
        return <FiCheckCircle className="text-blue-400" size={18} />;
      case "PIPELINE":
        return <FiAlertCircle className="text-amber-400" size={18} />;
      default:
        return <FiBell className="text-yellow-400" size={18} />;
    }
  };

  const getBorderColor = (category: string | null) => {
    switch (category) {
      case "MESSAGE":
        return "border-yellow-400/40 shadow-yellow-400/10";
      case "DOCUMENT":
        return "border-emerald-500/40 shadow-emerald-500/10";
      case "CONTRACT":
        return "border-blue-500/40 shadow-blue-500/10";
      case "PIPELINE":
        return "border-amber-400/40 shadow-amber-400/10";
      default:
        return "border-yellow-400/30 shadow-yellow-400/5";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border ${getBorderColor(
              activeToast.category
            )} p-4 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden`}
          >
            {/* Top accent glow line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                {getCategoryIcon(activeToast.category)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400">
                    Live Notification
                  </span>
                  <button
                    onClick={() => setActiveToast(null)}
                    className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                <h4 className="text-white font-black text-xs mt-0.5 leading-snug truncate">
                  {activeToast.title}
                </h4>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed line-clamp-2">
                  {activeToast.message}
                </p>
              </div>
            </div>

            {activeToast.actionUrl && (
              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <Link
                  href={activeToast.actionUrl}
                  onClick={() => setActiveToast(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-[11px] font-black rounded-xl transition-all shadow-md cursor-pointer"
                >
                  View Details <FiArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
