"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto shadow-inner">
          <FiAlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Portal Service Notice
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system encountered a brief session or connection delay. Please reload to restore your dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 text-black font-black rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all cursor-pointer shadow-lg shadow-yellow-400/20"
          >
            <FiRefreshCw size={14} />
            <span>Reload Portal</span>
          </button>

          <Link
            href="/portal/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <FiHome size={14} />
            <span>Return to Login</span>
          </Link>
        </div>

        {error?.digest && (
          <p className="text-[10px] text-slate-600 font-mono">
            Ref ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
