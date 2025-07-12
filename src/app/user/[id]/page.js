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
  // ... implement swap request modal here (see next step)
  return <div style={{ color: "#fff" }}>Swap request modal coming soon... <button onClick={onClose}>Close</button></div>;
} 