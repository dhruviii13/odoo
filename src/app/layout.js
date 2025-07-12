"use client";

import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  // Simple client-side check for /admin route
  let isAdmin = false;
  if (typeof window !== "undefined") {
    isAdmin = window.location.pathname.startsWith("/admin");
  }
  return (
    <html lang="en">
      <body>
        {!isAdmin && (
          <nav className="w-full flex items-center justify-between px-6 py-4 border-b">
            <div className="text-xl font-bold">SkillMate</div>
            <div className="flex items-center gap-6">
              <Link href="/">Home</Link>
              <Link href="/swap-history">Swap Requests</Link>
              <Link href="/profile">Profile</Link>
              <Link href="/login">Login</Link>
            </div>
          </nav>
        )}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
