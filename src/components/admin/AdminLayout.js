'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Settings,
  Menu,
  X,
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Skills', href: '/admin/skills', icon: Shield },
  { name: 'Swaps', href: '/admin/swaps', icon: Activity },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen fixed z-40 glass border-r-4 border-accent shadow-xl rounded-none">
        <div className="flex h-16 items-center px-6 border-b border-accent/40">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/80 to-blue-500/80 text-white shadow-lg scale-105 border border-accent'
                    : 'text-white hover:bg-accent/10 hover:text-white border border-transparent'
                }`}
              >
                <item.icon
                  className={`mr-4 h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-white drop-shadow-glow' : 'text-accent group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}> 
        <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col glass border-r-4 border-accent shadow-xl rounded-none">
          <div className="flex h-16 items-center justify-between px-6 border-b border-accent/40">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow">Admin Panel</h1>
            <button
              className="text-white hover:text-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/80 to-blue-500/80 text-white shadow-lg scale-105 border border-accent'
                      : 'text-white hover:bg-accent/10 hover:text-white border border-transparent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-white drop-shadow-glow' : 'text-accent group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Page content */}
        <main className="flex-1 py-10 px-4 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Add this to your globals.css for a glow effect:
// .drop-shadow-glow { text-shadow: 0 0 8px #a78bfa, 0 0 16px #818cf8; } 