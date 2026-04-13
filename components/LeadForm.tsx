"use client";

export default function LeadForm({ onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      
      <div className="bg-white text-black rounded-xl p-6 w-full max-w-md relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center">
          Apply Now
        </h2>

        <form className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 border rounded"
          />

          <input
            type="email"
            placeholder="Email (optional)"
            className="w-full p-3 border rounded"
          />

          <select className="w-full p-3 border rounded">
            <option>Visa</option>
            <option>Exit Permit</option>
          </select>

          <button className="w-full bg-green-500 text-white py-3 rounded font-semibold">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}