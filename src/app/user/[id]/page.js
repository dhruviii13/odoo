"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PublicUserProfile() {
  const { id } = useParams();
  const [token, setToken] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { data, isLoading, error } = useSWR(
    id ? `/api/user/${id}` : null,
    fetcher
  );

  if (isLoading) return <div style={{ color: "#fff", padding: 40 }}>Loading profile...</div>;
  if (error || !data?.user) return <div style={{ color: "#ff4d4f", padding: 40 }}>Failed to load profile.</div>;

  const user = data.user;

  return (
    <main style={{ minHeight: "100vh", background: "#181f2a", padding: 40 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", background: "rgba(30,40,60,0.7)", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", border: "1px solid rgba(255,255,255,0.18)", padding: 32, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#222", border: "2px solid #00fff7", overflow: "hidden" }}>
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#00fff7", fontWeight: 700, fontSize: 40 }}>{user.name?.[0] || "?"}</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 28, color: "#fff" }}>{user.name}</div>
            <div style={{ fontSize: 16, color: "#00fff7" }}>{user.email}</div>
            <div style={{ fontSize: 14, color: "#fff" }}>Location: {user.location || "-"}</div>
            <div style={{ fontSize: 14, color: "#fff" }}>Availability: {user.availability || "-"}</div>
            <div style={{ fontSize: 14, color: "#fff" }}>Profile: {user.isPublic ? "Public" : "Private"}</div>
          </div>
        </div>
        <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Skills Offered:</div>
        <div style={{ marginBottom: 12 }}>{user.skillsOffered?.join(", ") || "-"}</div>
        <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Skills Wanted:</div>
        <div style={{ marginBottom: 12 }}>{user.skillsWanted?.join(", ") || "-"}</div>
        <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Rating & Feedback:</div>
        <div style={{ marginBottom: 12 }}>{user.rating || "-"} ({user.feedbackCount || 0} feedbacks)</div>
        {token ? (
          <button onClick={() => setShowRequest(true)} style={{ padding: "12px 32px", borderRadius: 8, border: "none", background: "#00fff7", color: "#222", fontWeight: 700, fontSize: 18, boxShadow: "0 0 8px #00fff7", cursor: "pointer", marginTop: 24 }}>Request</button>
        ) : (
          <div style={{ color: "#fff", marginTop: 24 }}>Login to request a swap.</div>
        )}
        {showRequest && <SwapRequestModal user={user} onClose={() => setShowRequest(false)} />}
      </div>
    </main>
  );
}

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
    } catch (err) {
      setError(err.message || "Failed to request swap");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "#181828", borderRadius: 16, padding: 32, minWidth: 320, color: "#fff", boxShadow: "0 8px 32px #000a" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Request Swap</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Skill You Offer:</label>
          <input value={offeredSkill} onChange={e => setOfferedSkill(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Skill You Want:</label>
          <input value={requestedSkill} onChange={e => setRequestedSkill(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", marginTop: 4 }} />
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