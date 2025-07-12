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
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function SidebarLink({ icon, label, href, active }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-4 py-3 rounded-lg flex items-center gap-3 shadow"
          : "text-gray-400 hover:bg-gray-800 px-4 py-3 rounded-lg flex items-center gap-3 transition"
      }
    >
      <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const mainNav = [
    { name: 'Dashboard', href: '/admin', icon: <BarChart3 /> },
  ];
  const manageNav = [
    { name: 'Users', href: '/admin/users', icon: <Users /> },
    { name: 'Skills', href: '/admin/skills', icon: <Shield /> },
    { name: 'Swaps', href: '/admin/swaps', icon: <Activity /> },
    { name: 'Messages', href: '/admin/messages', icon: <MessageSquare /> },
    { name: 'Reports', href: '/admin/reports', icon: <FileText /> },
  ];

  return (
    <div className="flex flex-row bg-black min-h-screen">
      {/* Sidebar */}
      <div className="bg-[#111827] min-h-screen w-64 px-6 py-8 flex flex-col justify-between shadow-xl hidden lg:flex">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-8">Admin</h1>
          <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-2">Main</p>
          <nav className="flex flex-col gap-1">
            {mainNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} active={pathname === item.href} />
            ))}
          </nav>
          <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-2 mt-4">Management</p>
          <nav className="flex flex-col gap-1">
            {manageNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} active={pathname === item.href} />
            ))}
          </nav>
        </div>
        <div className="mt-8 text-xs text-center text-gray-400">
          SkillMate Admin v1.0
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 px-8 py-12 bg-gradient-to-b from-[#0f0f23] to-black overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
} 