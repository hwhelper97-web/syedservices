"use client";

import { useEffect, useState } from "react";

export default function Logo() {
  const [fly, setFly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFly(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative cursor-pointer leading-tight overflow-visible">
      
      {/* TEXT (ALWAYS VISIBLE ✅) */}
      <h1 className="text-white text-lg font-semibold tracking-[0.2em]">
        Syed{" "}
        <span className="text-gray-300">Services</span>
      </h1>

      <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase mt-1">
        Travel • Visa • Tours
      </p>

      {/* ✈️ PREMIUM AIRPLANE */}
      {fly && (
        <div className="absolute top-1 left-0 animate-fly-plane">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-300"
          >
            <path
              d="M2 12L22 2L13 22L11 13L2 12Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}