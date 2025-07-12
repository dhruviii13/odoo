"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url, token) =>
  fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json());

export default function ProfilePage() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { data, isLoading, error, mutate } = useSWR(
    token ? ["/api/user/profile", token] : null,
    fetcher
  );

  if (!token) {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        Please <a href="/login" style={{ color: "#00fff7" }}>login</a> to view your profile.
      </div>
    );
  }

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
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <button onClick={() => setTab("profile")} style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: tab === "profile" ? "#00fff7" : "#222", color: tab === "profile" ? "#222" : "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Profile</button>
          <button onClick={() => setTab("swaps")} style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: tab === "swaps" ? "#00fff7" : "#222", color: tab === "swaps" ? "#222" : "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Swap Requests</button>
          <button onClick={() => setTab("edit")} style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: tab === "edit" ? "#00fff7" : "#222", color: tab === "edit" ? "#222" : "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Edit Profile</button>
        </div>
        {tab === "profile" && (
          <div>
            <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Skills Offered:</div>
            <div style={{ marginBottom: 12 }}>{user.skillsOffered?.join(", ") || "-"}</div>
            <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Skills Wanted:</div>
            <div style={{ marginBottom: 12 }}>{user.skillsWanted?.join(", ") || "-"}</div>
            <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Swaps Completed:</div>
            <div style={{ marginBottom: 12 }}>{user.swapsCompleted || 0}</div>
            <div style={{ fontWeight: 700, color: "#00fff7", marginBottom: 8 }}>Feedback:</div>
            <div>{user.feedbackCount || 0}</div>
          </div>
        )}
        {tab === "swaps" && (
          <SwapRequests token={token} />
        )}
        {tab === "edit" && (
          <EditProfile user={user} token={token} mutate={mutate} />
        )}
      </div>
    </main>
  );
}

function SwapRequests({ token }) {
  const [tab, setTab] = useState('received');
  const fetcher = (url) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
  const { data, isLoading, error, mutate } = useSWR(token ? [`/api/swap?tab=${tab}`, token] : null, fetcher);

  if (isLoading) return <div style={{ color: '#fff' }}>Loading swap requests...</div>;
  if (error) return <div style={{ color: '#ff4d4f' }}>Failed to load swap requests.</div>;
  const requests = data?.requests || [];

  const handleAction = async (id, action) => {
    await fetch(`/api/swap/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    });
    mutate();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button onClick={() => setTab('received')} style={{ padding: 8, borderRadius: 8, border: 'none', background: tab === 'received' ? '#00fff7' : '#222', color: tab === 'received' ? '#222' : '#fff', fontWeight: 700 }}>Received</button>
        <button onClick={() => setTab('sent')} style={{ padding: 8, borderRadius: 8, border: 'none', background: tab === 'sent' ? '#00fff7' : '#222', color: tab === 'sent' ? '#222' : '#fff', fontWeight: 700 }}>Sent</button>
      </div>
      {requests.length === 0 ? (
        <div style={{ color: '#fff' }}>No swap requests.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map((req) => (
            <div key={req._id} style={{ background: 'rgba(0,255,247,0.08)', borderRadius: 12, padding: 16, border: '1px solid #00fff7', color: '#fff' }}>
              <div><b>{tab === 'received' ? 'From' : 'To'}:</b> {tab === 'received' ? req.fromUser?.name : req.toUser?.name}</div>
              <div><b>Skill Offered:</b> {req.skillOffered}</div>
              <div><b>Skill Wanted:</b> {req.skillWanted}</div>
              <div><b>Message:</b> {req.message}</div>
              <div><b>Status:</b> <span style={{ color: req.status === 'Accepted' ? '#00ff99' : req.status === 'Rejected' ? '#ff4d4f' : '#fff' }}>{req.status}</span></div>
              {tab === 'received' && req.status === 'Pending' && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => handleAction(req._id, 'accept')} style={{ marginRight: 8, padding: '6px 16px', borderRadius: 8, border: 'none', background: '#00ff99', color: '#222', fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => handleAction(req._id, 'reject')} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#ff4d4f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditProfile({ user, token, mutate }) {
  const [form, setForm] = useState({
    name: user.name || '',
    location: user.location || '',
    skillsOffered: user.skillsOffered?.join(', ') || '',
    skillsWanted: user.skillsWanted?.join(', ') || '',
    availability: user.availability || '',
    isPublic: user.isPublic || false,
    profilePhoto: user.profilePhoto || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    let photoUrl = form.profilePhoto;
    if (photoFile) {
      const data = new FormData();
      data.append('file', photoFile);
      const res = await fetch('/api/upload', { method: 'POST', body: data, headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.url) photoUrl = result.url;
    }
    const payload = {
      name: form.name,
      location: form.location,
      skillsOffered: form.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
      skillsWanted: form.skillsWanted.split(',').map(s => s.trim()).filter(Boolean),
      availability: form.availability,
      isPublic: form.isPublic,
      profilePhoto: photoUrl,
    };
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSuccess('Profile updated!');
      mutate();
    } else {
      setError('Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>Name <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #00fff7', background: '#222', color: '#fff' }} /></label>
      <label>Location <input name="location" value={form.location} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #00fff7', background: '#222', color: '#fff' }} /></label>
      <label>Skills Offered (comma separated) <input name="skillsOffered" value={form.skillsOffered} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #00fff7', background: '#222', color: '#fff' }} /></label>
      <label>Skills Wanted (comma separated) <input name="skillsWanted" value={form.skillsWanted} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #00fff7', background: '#222', color: '#fff' }} /></label>
      <label>Availability <input name="availability" value={form.availability} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #00fff7', background: '#222', color: '#fff' }} /></label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Public Profile <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} /></label>
      <label>Profile Photo <input type="file" accept="image/*" onChange={handlePhotoChange} /></label>
      <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#00fff7', color: '#222', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
      {error && <div style={{ color: '#ff4d4f' }}>{error}</div>}
      {success && <div style={{ color: '#00ff99' }}>{success}</div>}
    </form>
  );
} 