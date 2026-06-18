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
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star            },
  { href: '/admin/contact',      label: 'Messages',     icon: MessageSquare   },
];

const PAGE_LABELS = {
  dashboard: 'Dashboard', bookings: 'Bookings', services: 'Services',
  gallery: 'Gallery', testimonials: 'Testimonials', contact: 'Messages',
  ai: 'AI Assistant', users: 'Users',
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
    <div className="min-h-screen flex bg-cream">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-40 w-60 h-screen flex flex-col bg-cream transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ borderRight: '1px solid #EBE3D5' }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #EBE3D5' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-olive-100 rounded-lg flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-4 h-4 text-olive-600" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-brown-700 leading-tight text-base">Zuniii Admin</h1>
              <p className="text-xs text-brown-400">CMS Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-olive-500 text-white shadow-sm'
                    : 'text-brown-500 hover:bg-beige-100 hover:text-brown-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brown-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #EBE3D5' }}>
          {adminUser && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-beige-50 mb-2">
              <div className="w-7 h-7 rounded-lg bg-olive-100 flex items-center justify-center shrink-0">
                <ProfileIcon name={adminUser.emoji} className="w-4 h-4 text-olive-600 fill-olive-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-brown-700 truncate leading-tight">{adminUser.name}</p>
                <p className="text-xs text-brown-400">Admin</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-brown-400 hover:bg-beige-100 hover:text-brown-600 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
          <Link href="/"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-brown-400 hover:text-olive-600 transition-colors mt-0.5">
            <ExternalLink className="w-4 h-4 shrink-0" /> View Website
          </Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-cream px-6 py-3.5"
          style={{ borderBottom: '1px solid #EBE3D5' }}>
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-1.5 rounded-lg text-brown-500 hover:bg-beige-100">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-base font-semibold text-brown-700">{pageTitle}</h2>
            </div>
            {adminUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-beige-50 border border-beige-200">
                <div className="w-6 h-6 rounded-lg bg-olive-100 flex items-center justify-center">
                  <ProfileIcon name={adminUser.emoji} className="w-3.5 h-3.5 text-olive-600 fill-olive-600" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-brown-600">{adminUser.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}
