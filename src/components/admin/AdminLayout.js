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

function SidebarLink({ icon, label, href, collapsed, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center px-3 py-3 text-sm font-semibold transition-all duration-150
        ${active && !collapsed ? 'bg-gradient-to-r from-purple-600/80 to-blue-500/80 text-white shadow-lg border border-accent' : ''}
        ${!active && !collapsed ? 'text-white hover:bg-accent/10 hover:text-white border border-transparent rounded-lg' : ''}
        ${collapsed && active ? 'bg-gradient-to-br from-purple-500 to-blue-500 w-full h-full' : ''}
        ${collapsed ? 'justify-center' : 'rounded-lg'}`}
      title={collapsed ? label : ''}
      style={collapsed && active ? { borderRadius: 0 } : {}}
    >
      {collapsed ? (
        <span className="flex items-center justify-center h-8 w-8">
          {icon}
        </span>
      ) : (
        <span className={"mr-3 h-5 w-5"}>{icon}</span>
      )}
      {!collapsed && label}
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Navigation sections
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
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col fixed z-40 glass border-r-4 border-accent shadow-xl h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}> 
        <div className="flex h-16 items-center px-4 border-b border-accent/40">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow">
              Admin
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1 text-white hover:text-accent transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 space-y-6 px-2 py-4 overflow-y-auto">
          <div>
            <div className={`text-xs uppercase tracking-wider text-gray-400 px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>Main</div>
            {mainNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} collapsed={sidebarCollapsed} active={pathname === item.href} />
            ))}
          </div>
          <div>
            <div className={`text-xs uppercase tracking-wider text-gray-400 px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>Management</div>
            {manageNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} collapsed={sidebarCollapsed} active={pathname === item.href} />
            ))}
          </div>
        </nav>
        <div className="mt-auto p-4 text-xs text-center text-gray-400">
          <span>SkillMate Admin v1.0</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 flex w-64 flex-col glass border-r-4 border-accent shadow-xl h-screen z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-accent/40">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow">
            Admin Panel
          </h1>
          <button
            className="text-white hover:text-accent transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-6 px-2 py-4 overflow-y-auto">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 px-3 py-2">Main</div>
            {mainNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} collapsed={false} active={pathname === item.href} onClick={() => setSidebarOpen(false)} />
            ))}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 px-3 py-2">Management</div>
            {manageNav.map(item => (
              <SidebarLink key={item.name} icon={item.icon} label={item.name} href={item.href} collapsed={false} active={pathname === item.href} onClick={() => setSidebarOpen(false)} />
            ))}
          </div>
        </nav>
        <div className="mt-auto p-4 text-xs text-center text-gray-400">
          <span>SkillMate Admin v1.0</span>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Mobile header */}
        <div className="lg:hidden glass border-b-4 border-accent px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:text-accent transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            <div className="w-6"></div>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
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