"use client";
import Link from "next/link";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const isAdminRoute = pathname && pathname.startsWith("/admin");

  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen">
        {/* Only show navbar if not on admin route */}
        {!isAdminRoute && (
          <nav className="bg-black/90 backdrop-blur flex justify-between items-center px-6 py-4 fixed top-0 w-full z-50 border-b border-gray-900 shadow-md">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logos/logo.png" alt="SkillMate Logo" className="h-8 w-8 max-w-[32px] max-h-[32px] object-contain" />
                <span className="text-2xl font-extrabold tracking-tight text-indigo-400">SkillMate</span>
              </Link>
              <Link href="/swap-history" className="text-gray-200 hover:text-indigo-400 font-medium transition-colors">Swap History</Link>
              <Link href="/profile" className="text-gray-200 hover:text-indigo-400 font-medium transition-colors">Profile</Link>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout}
                  className="border border-red-500 text-red-400 font-bold px-6 py-2 rounded-full shadow-md hover:bg-red-900/30 transition-all"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="border border-indigo-500 text-indigo-400 font-bold px-6 py-2 rounded-full shadow-md hover:bg-indigo-900/30 transition-all">Login</Link>
              )}
            </div>
          </nav>
        )}
        <main className={isAdminRoute ? "w-full h-full min-h-screen bg-black" : "pt-24 max-w-6xl mx-auto px-6"}>{children}</main>
      </body>
    </html>
  );
}
