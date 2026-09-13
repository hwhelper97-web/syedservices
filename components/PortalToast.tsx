"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";

export interface ToastMessage {
  text: string;
  type?: "success" | "error" | "info";
}

interface PortalToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function PortalToast({ toast, onClose }: PortalToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`fixed top-6 right-6 z-50 max-w-md w-[92%] sm:w-auto px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-3.5 backdrop-blur-xl pointer-events-auto ${
            toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50"
              : toast.type === "info"
              ? "bg-yellow-950/90 border-yellow-400/40 text-yellow-200 shadow-yellow-950/50"
              : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "error"
                ? "bg-rose-500/20 text-rose-400"
                : toast.type === "info"
                ? "bg-yellow-400/20 text-yellow-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {toast.type === "error" ? (
              <FiAlertTriangle size={16} />
            ) : toast.type === "info" ? (
              <FiInfo size={16} />
            ) : (
              <FiCheckCircle size={16} />
            )}
          </div>

          <div className="flex-1 pr-2 leading-relaxed">
            {toast.text}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <FiX size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
