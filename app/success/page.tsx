export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020617] to-[#0f172a]">

      <div className="p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur text-center space-y-4">

        <h1 className="text-3xl font-bold text-green-400">
          Application Submitted ✅
        </h1>

        <p className="text-gray-400">
          Our team will review your application and contact you shortly.
        </p>

        <a
          href="/"
          className="inline-block mt-4 bg-yellow-500 text-black px-6 py-3 rounded-xl hover:scale-105 transition"
        >
          Go Back Home
        </a>

      </div>

    </div>
  );
}