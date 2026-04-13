"use client";

import { useEffect, useState } from "react";
import mapData from "@/data/mapData";

// ✅ Handle both structures
const data = (mapData as any).state_bbox_array
  ? mapData
  : (mapData as any).simplemaps_worldmap_mapinfo;

// 🌍 Country names
const countryNames: Record<string, string> = {
  PK: "Pakistan",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  TR: "Turkey",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  CN: "China",
  IN: "India",
  RU: "Russia",
  BR: "Brazil",
};

// 🎯 Get center
function getCenter(bbox: any) {
  return {
    x: (bbox.x + bbox.x2) / 2,
    y: (bbox.y + bbox.y2) / 2,
  };
}

export default function WorldMapPro() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [routes, setRoutes] = useState<any[]>([]);

  // ✅ FIX hydration issue (generate routes on client only)
  useEffect(() => {
    const countries = Object.keys(data.state_bbox_array);

    const newRoutes = Array.from({ length: 10 }).map(() => {
      const fromCode =
        countries[Math.floor(Math.random() * countries.length)];
      const toCode =
        countries[Math.floor(Math.random() * countries.length)];

      const from = getCenter(data.state_bbox_array[fromCode]);
      const to = getCenter(data.state_bbox_array[toCode]);

      const d = `
        M ${from.x} ${from.y}
        Q ${(from.x + to.x) / 2} ${from.y - 80}
        ${to.x} ${to.y}
      `;

      return { d };
    });

    setRoutes(newRoutes);
  }, []);

  return (
    <div className="w-full h-[600px] bg-black relative overflow-hidden">
      
      <svg viewBox="0 0 2000 1000" className="w-full h-full">

        {/* 🌍 Countries */}
        {Object.entries(data.paths).map(([code, path]) => (
          <path
            key={code}
            d={path as string}
            fill="#374151"        // softer gray (premium)
            stroke="#6b7280"
            strokeWidth="0.4"
            className="hover:fill-gray-500 transition cursor-pointer"
            onMouseEnter={() => setHovered(code)}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={(e) =>
              setPosition({ x: e.clientX, y: e.clientY })
            }
          />
        ))}

        {/* ✈️ Flight simulation */}
        {routes.map((route, i) => (
          <g key={i}>
            <path
              id={`route-${i}`}
              d={route.d}
              fill="none"
              stroke="#4ade80"   // softer green (premium)
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className="opacity-60"
            />

            {/* Moving dot */}
            <circle r="2.5" fill="#4ade80">
              <animateMotion dur="6s" repeatCount="indefinite">
                <mpath xlinkHref={`#route-${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>

      {/* 🧠 Tooltip */}
      {hovered && (
        <div
          className="fixed bg-white text-black px-3 py-1 rounded shadow text-sm pointer-events-none"
          style={{
            top: position.y + 10,
            left: position.x + 10,
          }}
        >
          {countryNames[hovered] || hovered}
        </div>
      )}
    </div>
  );
}