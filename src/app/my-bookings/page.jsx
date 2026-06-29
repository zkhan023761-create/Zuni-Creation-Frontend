'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Tag, Sparkles, ArrowRight, AlertCircle, Flower, User, Home, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAuthAPI } from '@/lib/api';
import InitialsAvatar from '@/components/InitialsAvatar';

// ── Status badge config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   classes: 'bg-gold-100 text-gold-600 border-gold-200'     },
  confirmed: { label: 'Confirmed', classes: 'bg-olive-100 text-olive-600 border-olive-200' },
  completed: { label: 'Completed', classes: 'bg-brown-100 text-brown-600 border-brown-200' },
  cancelled: { label: 'Cancelled', classes: 'bg-beige-200 text-brown-700 border-beige-300' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-beige-200 rounded w-2/5" />
        <div className="h-5 bg-beige-200 rounded-full w-20" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-beige-100 rounded w-3/5" />
        <div className="h-4 bg-beige-100 rounded w-2/5" />
        <div className="h-4 bg-beige-100 rounded w-1/3" />
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
}

function BookingCard({ booking }) {
  const serviceName =
    typeof booking.service === 'object' && booking.service !== null
      ? booking.service.name
      : booking.service ?? '—';

  return (
    <div className="card p-6 hover:border-olive-200 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-brown-700 font-serif font-bold text-lg leading-tight">{serviceName}</h3>
        <StatusBadge status={booking.status} />
      </div>
      <ul className="space-y-2.5 text-sm text-brown-500">
        <li className="flex items-center gap-2.5">
          <Calendar size={15} className="text-olive-500 shrink-0" />
          <span>{formatDate(booking.preferredDate)}</span>
        </li>
        {booking.occasion && (
          <li className="flex items-center gap-2.5">
            <Sparkles size={15} className="text-olive-500 shrink-0" />
            <span>{booking.occasion}</span>
          </li>
        )}
        {booking.numberOfPeople != null && (
          <li className="flex items-center gap-2.5">
            <Users size={15} className="text-olive-500 shrink-0" />
            <span>{booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────────
function ProfileTab({ user, bookings }) {
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-6">
        <span className="text-olive-500 text-xs font-bold uppercase tracking-widest mb-1 block">My Account</span>
        <h2 className="text-3xl font-serif font-bold text-brown-700">PROFILE</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="bg-white border border-beige-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-brown-700 font-serif font-bold text-lg mb-6">PERSONAL INFORMATION</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-brown-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="px-4 py-3 bg-beige-50 rounded-xl text-brown-700 border border-beige-100 font-medium">
                {user.name}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-brown-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="px-4 py-3 bg-beige-50 rounded-xl text-brown-700 border border-beige-100 font-medium">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary & Quick Links */}
        <div className="space-y-8">
          <div className="bg-white border border-beige-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-brown-700 font-serif font-bold text-lg mb-6">ACCOUNT SUMMARY</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-beige-100">
                <span className="text-brown-500 text-sm font-medium">Total Bookings</span>
                <span className="font-bold text-olive-600">{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-beige-100">
                <span className="text-brown-500 text-sm font-medium">Pending Requests</span>
                <span className="font-bold text-gold-600">{pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-brown-500 text-sm font-medium">Member Status</span>
                <span className="px-2 py-1 bg-olive-100 text-olive-600 text-xs font-bold rounded uppercase">Active Member</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-beige-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-brown-700 font-serif font-bold text-lg mb-4">QUICK LINKS</h3>
            <Link href="/services" className="flex items-center justify-between p-3 rounded-xl hover:bg-beige-50 transition-colors group">
              <span className="text-brown-600 font-medium group-hover:text-olive-600">Browse Services</span>
              <ChevronRight size={18} className="text-brown-300 group-hover:text-olive-500" />
            </Link>
            <Link href="/contact" className="flex items-center justify-between p-3 rounded-xl hover:bg-beige-50 transition-colors group">
              <span className="text-brown-600 font-medium group-hover:text-olive-600">Contact Support</span>
              <ChevronRight size={18} className="text-brown-300 group-hover:text-olive-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bookings Tab ─────────────────────────────────────────────────────────────────
function BookingsTab({ bookings, fetchLoading, error }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <span className="text-olive-500 text-xs font-bold uppercase tracking-widest mb-1 block">My Account</span>
        <h2 className="text-3xl font-serif font-bold text-brown-700">MY BOOKINGS</h2>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {fetchLoading && (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {!fetchLoading && bookings.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-5">
          {bookings.map((booking, i) => (
            <BookingCard key={booking._id ?? i} booking={booking} />
          ))}
        </div>
      )}

      {!fetchLoading && bookings.length === 0 && !error && (
        <div className="bg-white border border-beige-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-olive-50 rounded-full flex items-center justify-center mb-5">
            <Flower size={36} className="text-olive-400 fill-olive-100" />
          </div>
          <h3 className="text-xl font-serif font-bold text-brown-700 mb-2">No bookings found</h3>
          <p className="text-brown-400 text-sm mb-6 max-w-sm">
            You haven't made any bookings yet. Browse our beautiful mehndi services to get started!
          </p>
          <Link href="/services" className="btn-primary">
            Explore Services <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Sidebar content (shared between desktop & mobile drawer) ──────────────────────
function SidebarContent({ user, activeTab, setActiveTab, logout, onNavClick }) {
  const handleNav = (tab) => {
    setActiveTab(tab);
    onNavClick?.();
  };

  return (
    <>
      {/* Profile Overview */}
      <div className="p-8 text-center border-b border-beige-100 bg-gradient-to-b from-olive-50/60 to-white">
        <div className="flex justify-center mb-4">
          <InitialsAvatar name={user.name} size="lg" />
        </div>
        <h3 className="text-brown-800 font-serif font-bold text-xl line-clamp-1">{user.name}</h3>
        <p className="text-brown-400 text-sm mb-3 truncate">{user.email}</p>
        <span className="inline-block px-3 py-1 bg-olive-50 border border-olive-200 text-olive-600 text-xs font-bold tracking-widest uppercase rounded-full">
          MEMBER
        </span>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex flex-col gap-0.5">
        <button
          onClick={() => handleNav('profile')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-olive-500 text-white shadow-sm shadow-olive-500/20'
              : 'text-brown-600 hover:bg-olive-50 hover:text-olive-700'
          }`}
        >
          <User size={17} className={activeTab === 'profile' ? 'text-white' : 'text-olive-500'} />
          Profile
        </button>

        <button
          onClick={() => handleNav('bookings')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'bookings'
              ? 'bg-olive-500 text-white shadow-sm shadow-olive-500/20'
              : 'text-brown-600 hover:bg-olive-50 hover:text-olive-700'
          }`}
        >
          <Tag size={17} className={activeTab === 'bookings' ? 'text-white' : 'text-olive-500'} />
          My Bookings
        </button>


        <div className="h-px bg-beige-200 my-2 mx-1" />

        <Link
          href="/"
          onClick={() => onNavClick?.()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-brown-500 hover:bg-beige-100 hover:text-brown-700 transition-all"
        >
          <Home size={17} className="text-brown-400" />
          Back to Home
        </Link>

        <button
          onClick={() => { onNavClick?.(); logout(); }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-brown-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={17} className="text-brown-400" />
          Sign Out
        </button>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab]       = useState('profile');
  const [bookings, setBookings]         = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError]               = useState('');
  const [drawerOpen, setDrawerOpen]     = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchBookings() {
      setFetchLoading(true); setError('');
      try {
        const res = await userAuthAPI.myBookings();
        setBookings(res.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
      } finally { setFetchLoading(false); }
    }
    fetchBookings();
  }, [user]);

  // Close drawer on route/tab change
  useEffect(() => { setDrawerOpen(false); }, [activeTab]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center pt-[72px]">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-olive-300 border-t-olive-600 rounded-full animate-spin" />
          <p className="text-brown-400 text-sm font-medium">Loadingâ€¦</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-beige-50 pt-[72px]">

      {/* â”€â”€ Mobile top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white border-b border-beige-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <InitialsAvatar name={user.name} size="sm" />
          <div>
            <p className="text-brown-800 font-bold text-sm leading-tight">{user.name}</p>
            <p className="text-brown-400 text-xs capitalize">{activeTab}</p>
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-xl text-brown-600 hover:bg-beige-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 lg:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile Drawer ────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full z-[70] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-beige-100">
          <span className="font-serif font-bold text-brown-700 text-lg">My Account</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-brown-400 hover:bg-beige-100 hover:text-brown-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          <SidebarContent
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            onNavClick={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      {/* â”€â”€ Main layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="container-xl py-8 md:py-12">
        <div className="flex gap-8 lg:gap-12">

          {/* â”€â”€ Desktop Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white border border-beige-200 rounded-3xl overflow-hidden shadow-sm sticky top-[100px]">
              <SidebarContent
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logout={logout}
              />
            </div>
          </div>

          {/* â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile'  && <ProfileTab  user={user} bookings={bookings} />}
            {activeTab === 'bookings' && <BookingsTab bookings={bookings} fetchLoading={fetchLoading} error={error} />}

          </div>

        </div>
      </div>
    </div>
  );
}
