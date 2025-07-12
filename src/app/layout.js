import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen">
        {/* Global Navbar */}
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
            <Link href="/login" className="border border-indigo-500 text-indigo-400 font-bold px-6 py-2 rounded-full shadow-md hover:bg-indigo-900/30 transition-all">Login</Link>
          </div>
        </nav>
        <main className="pt-24 max-w-6xl mx-auto px-6">{children}</main>
      </body>
    </html>
  );
}
