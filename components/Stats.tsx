"use client";
import { useEffect, useState } from "react";

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += Math.ceil(target / 50);
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setCount(start);
    }, 30);
  }, [target]);

  return <span>{count}</span>;
}

export default function Stats() {
  return (
    <section className="py-20 bg-black text-center">

      <h2 className="text-3xl font-bold text-yellow-400 mb-10">
        Our Achievements
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        <div className="bg-white/5 p-8 rounded-xl">
          <h3 className="text-4xl text-yellow-400 font-bold">
            <Counter target={5000} />+
          </h3>
          <p className="text-gray-400">Visas Processed</p>
        </div>

        <div className="bg-white/5 p-8 rounded-xl">
          <h3 className="text-4xl text-yellow-400 font-bold">
            <Counter target={1200} />+
          </h3>
          <p className="text-gray-400">Happy Clients</p>
        </div>

        <div className="bg-white/5 p-8 rounded-xl">
          <h3 className="text-4xl text-yellow-400 font-bold">
            <Counter target={99} />%
          </h3>
          <p className="text-gray-400">Success Rate</p>
        </div>

      </div>

    </section>
  );
}