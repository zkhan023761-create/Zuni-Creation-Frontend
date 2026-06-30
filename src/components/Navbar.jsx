'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import InitialsAvatar from '@/components/InitialsAvatar';

const navLinks = [
  { href: '/',        label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about',   label: 'About' },
  { href: '/services',label: 'Services' },
  { href: '/contact', label: 'Book Now' },
];

export default function Navbar() {
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname                = usePathname();
  const router                  = useRouter();
  const { user, logout }        = useAuth();
  const [admin, setAdmin]       = useState(null);

  const displayName = user
    ? (user.name.length > 15 ? user.name.slice(0, 15) + '...' : user.name)
    : null;

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    }
  }, [pathname]);

  const handleAdminLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    router.push('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(140,32,38,0.06)] border-b border-brown-200/10'
          : 'bg-cream/40 backdrop-blur-sm border-b border-brown-200/10'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl md:text-2xl font-serif font-bold text-brown-700 tracking-tight group-hover:text-olive-600 transition-colors">
              Zuniii Creation
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-olive-600 bg-olive-50'
                      : 'text-brown-600 hover:text-olive-600 hover:bg-olive-50/60'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-olive-500 rounded-full" />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-5 bg-beige-200 mx-2" />

            {admin ? (
              <>
                <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-semibold text-brown-700 hover:text-olive-600 transition-colors flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-olive-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-olive-700">A</span>
                  </div>
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="px-5 py-2.5 text-sm font-bold text-brown-600 border-2 border-brown-300 rounded-full hover:text-olive-600 hover:border-olive-500 hover:bg-olive-50 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : user ? (
              <>
                <Link href="/my-bookings" className="px-3 py-2 text-sm font-semibold text-brown-700 hover:text-olive-600 transition-colors flex items-center gap-2 group">
                  <InitialsAvatar name={user.name} size="xs" className="group-hover:scale-110 transition-transform" />
                  <span>{displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-sm font-bold text-brown-600 border-2 border-brown-300 rounded-full hover:text-olive-600 hover:border-olive-500 hover:bg-olive-50 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-bold text-brown-600 hover:text-olive-600 transition-colors rounded-full hover:bg-olive-50"
              >
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-brown-700 hover:bg-beige-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-beige-200">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      active
                        ? 'text-olive-600 bg-olive-50'
                        : 'text-brown-600 hover:text-olive-600 hover:bg-beige-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-2 mt-1 border-t border-beige-100">
                {admin ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-brown-700 hover:text-olive-600 transition-colors flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-olive-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-olive-700">A</span>
                      </div>
                      <span>Admin Panel</span>
                    </Link>
                    <button
                      onClick={() => { handleAdminLogout(); setIsOpen(false); }}
                      className="px-4 py-1.5 text-sm font-bold text-brown-600 border-2 border-brown-300 rounded-full hover:text-olive-600 hover:border-olive-500 hover:bg-olive-50 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link href="/my-bookings" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-brown-700 hover:text-olive-600 transition-colors flex items-center gap-2">
                      <InitialsAvatar name={user.name} size="xs" />
                      <span>{displayName}</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="px-4 py-1.5 text-sm font-bold text-brown-600 border-2 border-brown-300 rounded-full hover:text-olive-600 hover:border-olive-500 hover:bg-olive-50 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Link
                      href="/login"
                      className="text-sm font-bold text-brown-600 hover:text-olive-600 transition-colors px-4 py-2 rounded-full hover:bg-olive-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
