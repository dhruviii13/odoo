"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";

const AVAILABILITY = ["Weekends", "Evenings", "Mornings"];
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

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
            <div className="flex gap-4 mt-6 justify-center md:justify-start">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-xl font-semibold text-lg hover:scale-105 transition">Browse Skills</button>
              <button className="border border-white px-6 py-3 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition">Post Your Profile</button>
            </div>
          </div>
          {/* Right: Illustration */}
          <div className="flex-1 flex justify-center">
            <motion.img
              src="/hero-illustration.png"
              alt="SkillMate Illustration"
              className="w-full max-w-md rounded-xl object-contain drop-shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            />
          </div>
        </div>
      </section>
      {/* Profile Cards Grid */}
      <section className="w-full py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center text-gray-400 text-xl mb-8">Browse profiles</div>
          {isLoading ? (
            <div className="text-center text-gray-300 text-xl py-24">Loading users…</div>
          ) : error ? (
            <div className="text-center text-red-300 text-xl py-24">Failed to load users.</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-24">No users found.</div>
          ) :
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center border border-gray-800 hover:scale-105 duration-150"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-20 h-20 rounded-full bg-gray-900 border-4 border-indigo-900 mb-4 overflow-hidden flex items-center justify-center">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-indigo-400">{user.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div className="font-bold text-lg text-white mb-1">{user.name}</div>
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
                  <button className="w-full mt-auto py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Request Swap</button>
                </motion.div>
              ))}
            </motion.div>
          }
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-lg font-semibold border ${page === 1 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-black text-indigo-400 border-indigo-900 hover:bg-indigo-950"}`}
              >
                &laquo; Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg font-semibold border ${page === i + 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-black text-indigo-400 border-indigo-900 hover:bg-indigo-950"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className={`px-3 py-1 rounded-lg font-semibold border ${page === pagination.pages ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-black text-indigo-400 border-indigo-900 hover:bg-indigo-950"}`}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
