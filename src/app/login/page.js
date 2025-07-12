"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = tab === "login" ? "/api/user/login" : "/api/user/signup";
      const payload = tab === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/profile");
      } else {
        setError(data.message || data.error || "Login failed");
        console.error('Login error:', data);
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-black flex items-center justify-center font-sans">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-col md:flex-row max-w-6xl mx-auto py-24 px-6 gap-12 w-full">
        {/* Left Panel */}
        <div className="flex-1 bg-white/10 backdrop-blur-md p-10 rounded-xl text-white flex flex-col justify-center shadow-xl">
          <h2 className="text-3xl font-extrabold mb-6">Welcome to SkillMate</h2>
          <ul className="space-y-4 text-white/80 text-xl font-semibold">
            <li className="flex items-center gap-2"><span>✅</span> Verified profiles</li>
            <li className="flex items-center gap-2"><span>👥</span> Trusted community</li>
            <li className="flex items-center gap-2"><span>⏱</span> Flexible skill swaps</li>
          </ul>
        </div>
        {/* Right Panel (Form) */}
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-xl shadow-xl w-full max-w-md flex flex-col">
          {/* Tab Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setTab("login")}
              className={
                tab === "login"
                  ? "bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold"
                  : "bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold hover:bg-gray-800"
              }
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={
                tab === "signup"
                  ? "bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold"
                  : "bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold hover:bg-gray-800"
              }
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {tab === "signup" && (
              <input
                name="name"
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            )}
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg mt-4 font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              {loading ? (tab === "login" ? "Logging in..." : "Signing up...") : tab === "login" ? "Login" : "Sign Up"}
            </button>
            {error && <div className="text-red-400 text-center font-semibold mt-2">{error}</div>}
          </form>
        </div>
      </motion.div>
    </main>
  );
} 