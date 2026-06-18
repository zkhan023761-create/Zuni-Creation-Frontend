'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProfileIcon } from '@/lib/utils';
import {
  LayoutDashboard, Scissors, Calendar, Image,
  MessageSquare, Star, LogOut, Menu, X, ExternalLink, Brain, Users,
} from 'lucide-react';

const adminNavItems = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/bookings',     label: 'Bookings',     icon: Calendar        },
  { href: '/admin/users',        label: 'Users',        icon: Users           },
  { href: '/admin/services',     label: 'Services',     icon: Scissors        },
  { href: '/admin/gallery',      label: 'Gallery',      icon: Image           },
  { href: '/admin/contact',      label: 'Messages',     icon: MessageSquare   },
];

const PAGE_LABELS = {
  dashboard: 'Dashboard', bookings: 'Bookings', services: 'Services',
  gallery: 'Gallery', contact: 'Messages', users: 'Users',
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser]         = useState(null);
  const [isAuthed, setIsAuthed]           = useState(false);
  const [checking, setChecking]           = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminRaw = localStorage.getItem('admin');
    let isAdmin = false;
    if (token && adminRaw) {
      try {
        const user = JSON.parse(adminRaw);
        isAdmin = user?.role === 'admin';
      } catch {}
    }
    setIsAuthed(isAdmin);
    setChecking(false);
  }, [pathname]);

  useEffect(() => {
    if (!checking && !isAuthed) {
      router.replace('/login?tab=admin');
    }
  }, [checking, isAuthed, router]);

  useEffect(() => {
    const loadAdmin = () => {
      try {
        const stored = localStorage.getItem('admin');
        if (stored) setAdminUser(JSON.parse(stored));
      } catch {}
    };
    loadAdmin();
    window.addEventListener('admin-profile-updated', loadAdmin);
    return () => window.removeEventListener('admin-profile-updated', loadAdmin);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    setIsAuthed(false);
    setAdminUser(null);
    router.replace('/login?tab=admin');
  };

  // Still checking localStorage or not authed — render nothing to avoid flicker
  if (checking || !isAuthed) return null;

  const pageKey   = pathname.split('/').pop();
  const pageTitle = PAGE_LABELS[pageKey] || 'Admin';

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen flex flex-col bg-white transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-adminGreen-50 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-adminGreen-500" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-gray-900 leading-tight text-lg">Zuniii</h1>
              <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-adminGreen-500 text-white shadow-md shadow-adminGreen-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-6 border-t border-gray-100">
          {adminUser && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-3 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-adminGreen-100 flex items-center justify-center shrink-0">
                <ProfileIcon name={adminUser.emoji} className="w-4 h-4 text-adminGreen-600 fill-adminGreen-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate leading-tight">{adminUser.name}</p>
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5 shrink-0" /> Logout
          </button>
          <Link href="/"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-adminGreen-600 transition-colors mt-1">
            <ExternalLink className="w-5 h-5 shrink-0" /> View Website
          </Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
            </div>
            {adminUser && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-adminGreen-100 flex items-center justify-center">
                  <ProfileIcon name={adminUser.emoji} className="w-4 h-4 text-adminGreen-600 fill-adminGreen-600" />
                </div>
                <span className="hidden sm:inline text-sm font-bold text-gray-700">{adminUser.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

    </div>
  );
}
