"use client";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const { data, isLoading, error } = useSWR(
    `/api/user?search=${encodeURIComponent(search)}&skill=${encodeURIComponent(skill)}&page=${page}&limit=${limit}`,
    fetcher
  );

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "rgba(30,40,60,0.7)",
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          border: "1px solid rgba(255,255,255,0.18)",
          padding: 32,
          backdropFilter: "blur(8px)",
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#fff",
            textShadow: "0 0 8px #00fff7, 0 0 2px #fff",
            marginBottom: 24,
          }}
        >
          SkillMate: Find Skill Swap Partners
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          style={{ display: "flex", gap: 16, marginBottom: 32 }}
        >
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #00fff7",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              fontSize: 16,
            }}
          />
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #00fff7",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(90deg, #00fff7 0%, #007cf0 100%)",
              color: "#222",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 0 8px #00fff7",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Search
          </button>
        </form>
        {isLoading ? (
          <div style={{ color: "#fff", fontSize: 20 }}>Loading users...</div>
        ) : error ? (
          <div style={{ color: "#ff4d4f", fontSize: 20 }}>Failed to load users.</div>
        ) : users.length === 0 ? (
          <div style={{ color: "#fff", fontSize: 20 }}>No users found.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 24,
              marginBottom: 32,
            }}
          >
            {users.map((user) => (
              <div
                key={user._id}
                style={{
                  background: "rgba(0,255,247,0.08)",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 2px 16px 0 #00fff7",
                  border: "1px solid #00fff7",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 180,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#222",
                    marginBottom: 12,
                    border: "2px solid #00fff7",
                    overflow: "hidden",
                  }}
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        color: "#00fff7",
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {user.name?.[0] || "?"}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                <div style={{ fontSize: 14, color: "#00fff7", marginBottom: 6 }}>{user.email}</div>
                <div style={{ fontSize: 14, color: "#fff", marginBottom: 6 }}>
                  Skills Offered: {user.skillsOffered?.join(", ") || "-"}
                </div>
                <div style={{ fontSize: 14, color: "#fff", marginBottom: 6 }}>
                  Skills Wanted: {user.skillsWanted?.join(", ") || "-"}
                </div>
                <div style={{ fontSize: 12, color: "#00fff7" }}>
                  Swaps: {user.swapsCompleted || 0} | Feedback: {user.feedbackCount || 0}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: page === 1 ? "#222" : "#00fff7",
                color: page === 1 ? "#888" : "#222",
                fontWeight: 700,
                fontSize: 16,
                cursor: page === 1 ? "not-allowed" : "pointer",
                boxShadow: page === 1 ? "none" : "0 0 8px #00fff7",
              }}
            >
              Prev
            </button>
            <span style={{ color: "#fff", fontSize: 16, alignSelf: "center" }}>
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: page === pagination.pages ? "#222" : "#00fff7",
                color: page === pagination.pages ? "#888" : "#222",
                fontWeight: 700,
                fontSize: 16,
                cursor: page === pagination.pages ? "not-allowed" : "pointer",
                boxShadow: page === pagination.pages ? "none" : "0 0 8px #00fff7",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
