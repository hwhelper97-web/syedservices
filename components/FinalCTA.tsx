export default function FinalCTA() {
  return (
    <section className="py-24 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 text-black">

      <h2 className="text-4xl font-bold mb-4">
        Ready to Get Your Pakistan Visa?
      </h2>

      <p className="mb-8 text-lg">
        Apply now and get fast, secure processing with full support.
      </p>

      <div className="flex justify-center gap-4">

        {/* MAIN BUTTON */}
        <a
          href="/visa/pakistan/normal"
          className="px-8 py-4 rounded-xl font-bold bg-black text-white
                     hover:scale-105 transition
                     shadow-lg hover:shadow-[0_0_25px_rgba(0,0,0,0.6)]"
        >
          Apply for Visa
        </a>

        {/* SECONDARY BUTTON */}
        <a
          href="/visa/pakistan/exit"
          className="px-8 py-4 rounded-xl font-semibold border border-black
                     hover:bg-black hover:text-white transition"
        >
          Exit Permit
        </a>

      </div>

    </section>
  );
}