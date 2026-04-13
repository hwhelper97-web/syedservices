export default function MainCTA() {
  return (
    <section className="py-20 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 text-black">

      <h2 className="text-3xl font-bold mb-6">
        Start Your Application Now
      </h2>

      <div className="flex justify-center gap-4">

        <a href="/visa/pakistan/normal"
          className="bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition">
          Get Visa Now
        </a>

        <a href="/visa/pakistan/exit"
          className="bg-white text-black px-6 py-3 rounded-xl hover:scale-105 transition">
          Apply Exit Permit
        </a>

      </div>

    </section>
  );
}