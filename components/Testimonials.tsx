export default function Testimonials() {
  const data = [
    "Very fast visa service! Highly recommended.",
    "Professional and trusted agency.",
    "Got my exit permit without any issue!",
  ];

  return (
    <section className="py-20 bg-[#020617] text-center">

      <h2 className="text-3xl font-bold text-yellow-400 mb-10">
        What Our Clients Say
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">

        {data.map((t, i) => (
          <div
            key={i}
            className="p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur"
          >
            <p className="text-gray-300">"{t}"</p>
          </div>
        ))}

      </div>

    </section>
  );
}