"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = () => {
    if (
      email === "abidtanha1@gmail.com" &&
      password === "@Black0x22@"
    ) {
      localStorage.setItem("admin", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials ❌");
    }
  };

  const handleForgot = async () => {
    if (!email) {
      alert("Enter your email first");
      return;
    }

    await fetch("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    alert("Reset link sent 📩 (demo)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020617] to-[#0f172a] text-white">

      <div className="w-full max-w-md p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-5">

        <h1 className="text-xl font-bold text-yellow-400 text-center">
          Admin Login
        </h1>

        {!showForgot ? (
          <>
            <input
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-xl"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-xl"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:scale-105 transition"
            >
              Login
            </button>

            <p
              onClick={() => setShowForgot(true)}
              className="text-sm text-center text-gray-400 cursor-pointer hover:text-yellow-400"
            >
              Forgot Password?
            </p>
          </>
        ) : (
          <>
            <input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black/50 border rounded-xl"
            />

            <button
              onClick={handleForgot}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold"
            >
              Send Reset Link
            </button>

            <p
              onClick={() => setShowForgot(false)}
              className="text-sm text-center text-gray-400 cursor-pointer hover:text-yellow-400"
            >
              Back to Login
            </p>
          </>
        )}

        {error && <p className="text-red-400 text-center">{error}</p>}

      </div>
    </div>
  );
}