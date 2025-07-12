"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";

const AVAILABILITY = ["Weekends", "Evenings", "Mornings"];

const fetcher = (url) => fetch(url).then((res) => res.json());

// SwapRequestModal component
function SwapRequestModal({ user, onClose }) {
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUser: user._id,
          offeredSkill,
          requestedSkill,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request swap");
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message || "Failed to request swap");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "#181828", borderRadius: 16, padding: 32, minWidth: 320, color: "#fff", boxShadow: "0 8px 32px #000a" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Request Swap with {user.name}</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Skill You Offer:</label>
          <input value={offeredSkill} onChange={e => setOfferedSkill(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", marginTop: 4, background: "#222", color: "#fff" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Skill You Want:</label>
          <input value={requestedSkill} onChange={e => setRequestedSkill(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", marginTop: 4, background: "#222", color: "#fff" }} />
        </div>
        {error && <div style={{ color: "#ff4d4f", marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: "#00ffb0", marginBottom: 8 }}>Swap request sent!</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button type="submit" disabled={loading} style={{ background: "#00fff7", color: "#222", fontWeight: 700, padding: "8px 24px", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Sending..." : "Send Request"}</button>
          <button type="button" onClick={onClose} style={{ background: "#222", color: "#fff", padding: "8px 24px", borderRadius: 8, border: "none", marginLeft: 8 }}>Close</button>
        </div>
      </form>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (activeFilter) params.append("availability", activeFilter);
  params.append("page", page);
  params.append("limit", limit);

  const { data, isLoading, error } = useSWR(
    `/api/user?${params.toString()}`,
    fetcher
  );
  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="min-h-screen w-full font-sans">
      {/* Hero Section */}
      <section className="w-full py-24">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl w-full mx-auto px-6 gap-12">
          {/* Left: Text Stack */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="inline-block bg-indigo-700 text-xs uppercase tracking-widest rounded-full px-3 py-1">New</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">Swap Skills, Build Together</h1>
            <p className="text-lg text-gray-300 max-w-lg mx-auto md:mx-0">Connect. Learn. Grow. Offer and request skills from real people. SkillMate is your gateway to a world of collaborative learning and growth.</p>
            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search for skills or people..."
              className="w-full mt-4 px-5 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Availability Pills */}
            <div className="flex gap-2 mt-4 justify-center md:justify-start">
              {AVAILABILITY.map((a) => (
                <button
                  key={a}
                  onClick={() => { setActiveFilter(a === activeFilter ? null : a); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition border border-transparent ${activeFilter === a ? "bg-indigo-500 text-white" : "bg-gray-800 text-white hover:bg-indigo-600"}`}
                >
                  {a}
                </button>
              ))}
            </div>
            {/* Buttons */}
            <div className="flex gap-4 mt-8 justify-center md:justify-start">
              <button className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Get Started
              </button>
              <button className="border border-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">
                Learn More
              </button>
            </div>
          </div>
          {/* Right: Hero Image */}
          <div className="flex-1 flex justify-center">
            <img src="/hero-illustration.png" alt="Skill Swap Illustration" className="w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="w-full py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Find Your Skill Partner</h2>
          {isLoading ? (
            <div className="text-center text-gray-400">Loading users...</div>
          ) : error ? (
            <div className="text-center text-red-400">Error loading users</div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(user.skillsOffered || []).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded-full text-xs font-semibold">{skill}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(user.skillsWanted || []).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs font-semibold">{skill}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-xs text-gray-400 font-medium">{user.availability || "Available"}</span>
                  </div>
                  <button 
                    className="w-full mt-auto py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition" 
                    onClick={() => { setSelectedUser(user); setShowSwapModal(true); }}
                  >
                    Request Swap
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {showSwapModal && selectedUser && <SwapRequestModal user={selectedUser} onClose={() => setShowSwapModal(false)} />}
    </div>
  );
}
