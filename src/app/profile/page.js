"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";

const fetcher = ([url, token]) =>
  fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json());

const AVAILABILITY = ["Weekends", "Evenings", "Mornings"];

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

  const user = data?.user || {};
  const [form, setForm] = useState({
    name: "",
    location: "",
    skillsOffered: [],
    skillsWanted: [],
    availability: [],
    isPublic: false,
  });

  // Helper to compare user and form deeply
  function isUserEqualToForm(user, form) {
    return (
      user.name === form.name &&
      user.location === form.location &&
      JSON.stringify(user.skillsOffered || []) === JSON.stringify(form.skillsOffered) &&
      JSON.stringify(user.skillsWanted || []) === JSON.stringify(form.skillsWanted) &&
      JSON.stringify(user.availability || []) === JSON.stringify(form.availability) &&
      !!user.isPublic === !!form.isPublic
    );
  }

  useEffect(() => {
    // Only set form if user is not empty and different from form
    if (user && user.name && !isUserEqualToForm(user, form)) {
      setForm({
        name: user.name || "",
        location: user.location || "",
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || [],
        isPublic: user.isPublic || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvailability = (a) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(a)
        ? prev.availability.filter((v) => v !== a)
        : [...prev.availability, a],
    }));
  };

  const handleSkills = (type, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await mutate();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile");
    }
    setSaving(false);
  };
  const handleCancel = () => {
    setForm({
      name: user.name || "",
      location: user.location || "",
      skillsOffered: user.skillsOffered || [],
      skillsWanted: user.skillsWanted || [],
      availability: user.availability || [],
      isPublic: user.isPublic || false,
    });
    setErrorMsg("");
  };

  if (!token) {
    return (
      <div className="py-24 text-center text-white">
        Please <a href="/login" className="text-indigo-400 underline">login</a> to view your profile.
      </div>
    );
  }

  if (isLoading) return <div className="py-24 text-center text-gray-300">Loading profile…</div>;
  if (error || !data?.user) return <div className="py-24 text-center text-red-300">Failed to load profile.</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-black font-sans">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-10">My Profile</h1>
        <div className="flex flex-col md:flex-row gap-12 bg-gray-900 rounded-2xl shadow-xl p-10">
          {/* Left: Avatar */}
          <div className="flex flex-col items-center gap-6 md:w-1/3">
            <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-indigo-500 overflow-hidden flex items-center justify-center">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={form.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-extrabold text-indigo-400">{form.name?.[0] || "?"}</span>
              )}
            </div>
            {/* Avatar uploader (stub) */}
            <label className="block text-gray-300 font-medium cursor-pointer">
              <span className="underline">Change Photo</span>
              <input type="file" accept="image/*" className="hidden" disabled />
            </label>
          </div>
          {/* Right: Form */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Skills Offered</label>
                <input
                  name="skillsOffered"
                  value={form.skillsOffered.join(", ")}
                  onChange={e => handleSkills("skillsOffered", e.target.value)}
                  placeholder="e.g. Guitar, React, Cooking"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skillsOffered.filter(Boolean).map((skill, idx) => (
                    <span key={skill + idx} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs font-semibold">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Skills Wanted</label>
                <input
                  name="skillsWanted"
                  value={form.skillsWanted.join(", ")}
                  onChange={e => handleSkills("skillsWanted", e.target.value)}
                  placeholder="e.g. French, Yoga, Photoshop"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skillsWanted.filter(Boolean).map((skill, idx) => (
                    <span key={skill + idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-semibold">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Availability</label>
                <div className="flex gap-2 mt-1">
                  {AVAILABILITY.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => handleAvailability(a)}
                      className={`px-4 py-1 rounded-full text-sm font-semibold transition border border-transparent ${form.availability.includes(a) ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-200 hover:bg-indigo-500 hover:text-white"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} className="accent-indigo-500 w-5 h-5" />
                <span className="text-gray-300">Public Profile</span>
              </div>
            </div>
            {errorMsg && <div className="text-red-400 font-semibold text-center">{errorMsg}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 border border-indigo-500 text-indigo-400 px-6 py-3 rounded-lg font-bold text-lg hover:bg-indigo-900/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
} 