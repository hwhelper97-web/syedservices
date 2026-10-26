"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const iconDimensions = size === "sm" ? 34 : size === "lg" ? 48 : 40;

  return (
    <div className={`flex items-center gap-3 cursor-pointer select-none group ${className}`}>
      {/* Official Syed Services Logo Emblem */}
      <div 
        className="relative bg-white rounded-2xl flex items-center justify-center p-1 border border-yellow-400/30 shadow-md shadow-yellow-400/10 transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden"
        style={{ width: iconDimensions, height: iconDimensions }}
      >
        <Image
          src="/images/logo.png"
          alt="Syed Services Logo"
          width={iconDimensions}
          height={iconDimensions}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="text-left">
          {/* TEXT */}
          <span className="block text-white text-lg font-black tracking-wider leading-none">
            Syed <span className="text-yellow-400">Services</span>
          </span>
          <p className="text-[9px] text-slate-400 tracking-[0.22em] uppercase font-bold mt-1.5 leading-none">
            Travel • Visa • Tours
          </p>
        </div>
      )}
    </div>
  );
}
