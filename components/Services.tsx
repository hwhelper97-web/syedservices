"use client";

import Link from "next/link";
import { FaPassport, FaPlane, FaTicketAlt } from "react-icons/fa";

export default function Services() {
  const services = [
    {
      title: "Pakistan Visa",
      desc: "Fast visa processing with full support",
      icon: <FaPassport />,
      link: "/visa/pakistan/normal",
    },
    {
      title: "Exit Permit",
      desc: "Easy exit permit for people in Pakistan",
      icon: <FaTicketAlt />,
      link: "/visa/pakistan/exit",
    },
    {
      title: "Travel Services",
      desc: "Flight tickets & travel assistance",
      icon: <FaPlane />,
      link: "#",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-[#020617] text-center">

      <h2 className="text-3xl font-bold mb-12 text-yellow-400">
        Our Services
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {services.map((s, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur
                       hover:scale-105 hover:border-yellow-400 transition duration-300
                       shadow-xl group"
          >

            {/* ICON */}
            <div className="text-4xl text-yellow-400 mb-4 flex justify-center group-hover:scale-110 transition">
              {s.icon}
            </div>

            {/* TITLE */}
            <h3 className="text-xl font-semibold text-white mb-2">
              {s.title}
            </h3>

            {/* DESC */}
            <p className="text-gray-400 mb-6">
              {s.desc}
            </p>

            {/* BUTTON */}
            {s.link !== "#" ? (
              <Link
                href={s.link}
                className="inline-block bg-yellow-500 text-black px-5 py-2 rounded-lg
                           hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.7)] transition"
              >
                Apply Now
              </Link>
            ) : (
              <button className="inline-block bg-gray-600 text-white px-5 py-2 rounded-lg cursor-not-allowed">
                Coming Soon
              </button>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}