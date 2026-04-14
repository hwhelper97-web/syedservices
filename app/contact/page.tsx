"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Message sent successfully ✅");
        setForm({ name: "", email: "", message: "" });
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-black text-white">

      <div className="max-w-3xl w-full bg-white/5 p-10 rounded-2xl space-y-6">

        <h1 className="text-3xl font-bold text-yellow-400 text-center">
          Contact Us
        </h1>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 bg-black border rounded-xl"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 bg-black border rounded-xl"
        />

        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-3 bg-black border rounded-xl h-32"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {success && (
          <p className="text-green-400 text-center">{success}</p>
        )}

      </div>

    </section>
  );
}