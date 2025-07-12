"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";

const statusStyles = {
  Completed: {
    border: "border-green-500",
    badge: "bg-green-500/20 text-green-200 border border-green-400",
  },
  Pending: {
    border: "border-yellow-500",
    badge: "bg-yellow-400/20 text-yellow-100 border border-yellow-300",
  },
  Rejected: {
    border: "border-red-500",
    badge: "bg-red-500/20 text-red-200 border border-red-400",
  },
};

const fetcher = ([url, token, status]) =>
  fetch(`${url}${status && status !== "All" ? `?status=${status}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json());

export default function SwapHistoryPage() {
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { data, isLoading, error } = useSWR(
    token ? ["/api/swap-history", token, filter] : null,
    fetcher
  );
  const swaps = data?.swaps || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-black font-sans">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-6">Swap History</h1>
        {/* Tabs */}
        <div className="flex gap-4 mb-10">
          {["All", "Completed", "Pending", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={
                filter === tab
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow-md"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 px-4 py-2 rounded-full font-semibold"
              }
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Cards */}
        {isLoading ? (
          <div className="text-center text-gray-300 text-xl py-24">Loading swaps…</div>
        ) : error ? (
          <div className="text-center text-red-300 text-xl py-24">Failed to load swaps.</div>
        ) : swaps.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-24">No swaps found.</div>
        ) : (
          <motion.div className="flex flex-col gap-y-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            {swaps.map((swap) => {
              const style = statusStyles[swap.status] || statusStyles.Pending;
              return (
                <motion.div
                  key={swap._id}
                  className={`bg-gray-900 p-6 rounded-xl border-l-4 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center gap-4 ${style.border}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-white">{swap.withUser?.name || swap.withUser || "-"}</div>
                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>{swap.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <div><span className="text-gray-300">Skill Offered:</span> <span className="text-white font-semibold">{swap.skillOffered}</span></div>
                      <div><span className="text-gray-300">Skill Wanted:</span> <span className="text-white font-semibold">{swap.skillWanted}</span></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">{swap.date ? new Date(swap.date).toLocaleDateString() : "-"}</div>
                    {swap.feedback && (
                      <div className="mt-2 text-sm text-green-200 font-semibold">Feedback: {swap.feedback}</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
} 