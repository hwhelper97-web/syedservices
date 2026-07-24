"use client";

export default function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer select-none">
      {/* ✈️ PREMIUM AIRPLANE / LOGO ICON */}
      <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center border border-yellow-400/20 shadow-md transition-transform duration-300 hover:scale-105 shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
        </svg>
      </div>

      <div className="text-left">
        {/* TEXT */}
        <h1 className="text-white text-lg font-black tracking-wider leading-none">
          Syed <span className="text-yellow-400">Services</span>
        </h1>
        <p className="text-[9px] text-slate-400 tracking-[0.22em] uppercase font-bold mt-1.5 leading-none">
          Travel • Visa • Tours
        </p>
      </div>
    </div>
  );
}