'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Tag, Sparkles, ArrowRight, AlertCircle, Lock, Send, Eye, EyeOff, X, Flower } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAuthAPI } from '@/lib/api';
import { PROFILE_ICONS, ProfileIcon, resolveIconKey } from '@/lib/utils';

// ── Status badge config ────────────────────────────────────────────────────
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

// ── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ email, onClose }) {
  const [step, setStep]             = useState('send'); // 'send' | 'verify'
  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [info, setInfo]             = useState('');

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await userAuthAPI.sendResetOtp({ email });
      setStep('verify');
      setInfo('OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(''); setInfo('');
    try {
      await userAuthAPI.resetPassword({ email, otp, newPassword });
      setInfo('✅ Password changed successfully!');
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        {/* Change Password Modal */}
        <div className="bg-gradient-to-r from-olive-600 to-olive-500 px-6 py-5 flex items-center justify-between">
          <div>
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <Lock size={18} className="text-white" />
            </div>
            <h2 className="text-white font-serif font-bold text-lg">Change Password</h2>
            <p className="text-olive-100 text-xs mt-0.5">We'll send an OTP to verify it's you</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
          {info  && <div className="p-3 bg-olive-50 border border-olive-200 rounded-xl text-olive-700 text-sm">{info}</div>}

          {step === 'send' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-brown-500 text-sm">
                We'll send a one-time password to <span className="font-semibold text-brown-700">{email}</span> to verify your identity.
              </p>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Send size={15} /> Send OTP to Email</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">Enter OTP</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                  className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-center tracking-[0.5em] font-mono text-lg"
                  placeholder="• • • • • •" autoFocus />
              </div>
              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                  <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                    className="w-full pl-10 pr-10 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm"
                    placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep('send'); setOtp(''); setError(''); setInfo(''); }}
                  className="flex-1 py-3 border border-beige-200 text-brown-600 rounded-xl font-medium hover:bg-beige-50 transition-colors text-sm">
                  ← Resend OTP
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser } = useAuth();

  const [bookings, setBookings]         = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError]               = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [updatingIcon, setUpdatingIcon] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSelectIcon = async (emoji) => {
    setUpdatingIcon(true);
    try {
      const res = await userAuthAPI.updateEmoji({ emoji });
      updateUser(res.data);
      setShowIconPicker(false);
    } catch {
      alert('Failed to update profile icon');
    } finally {
      setUpdatingIcon(false);
    }
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center pt-16 md:pt-[72px]">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-olive-300 border-t-olive-600 rounded-full animate-spin" />
          <p className="text-brown-400 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-beige-50 pt-16 md:pt-[72px]">

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal email={user.email} onClose={() => setShowChangePassword(false)} />
      )}

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-olive-600 to-olive-500 text-white relative">
        <div className="container-xl py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-olive-100 text-xs font-semibold uppercase tracking-widest mb-3">
              <Tag size={12} />
              Customer Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">My Bookings</h1>
            <p className="text-olive-100 mt-2 text-sm">
              Welcome back, <span className="font-semibold text-white">{user.name}</span>
            </p>
          </div>

          {/* Profile card */}
          <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-xs shrink-0 self-start md:self-auto">
            {/* Avatar */}
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none shrink-0"
              title="Change Profile Icon"
              disabled={updatingIcon}
            >
              {updatingIcon
                ? <span className="w-6 h-6 border-2 border-olive-500 border-t-transparent rounded-full animate-spin" />
                : <ProfileIcon name={user.emoji} className="w-8 h-8 text-olive-500 fill-olive-500" />}
            </button>

            <div>
              <p className="font-bold text-white text-sm line-clamp-1">{user.name}</p>
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="text-xs text-olive-100 underline hover:text-white transition-colors block"
              >
                Change Icon
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-xs text-olive-100 underline hover:text-white transition-colors mt-0.5 flex items-center gap-1"
              >
                <Lock size={10} /> Change Password
              </button>
            </div>

            {/* Icon Selector Popover */}
            {showIconPicker && (
              <div className="absolute right-0 top-full mt-3 z-50 bg-white rounded-2xl p-4 shadow-xl border border-beige-200 w-64 animate-scale-in">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-beige-100">
                  <span className="text-xs font-bold text-brown-600">Select Profile Icon</span>
                  <button onClick={() => setShowIconPicker(false)} className="text-xs text-brown-400 hover:text-brown-600 font-bold text-lg leading-none">×</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PROFILE_ICONS.map(({ key, Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleSelectIcon(key)}
                      className={`p-2.5 rounded-xl hover:bg-olive-50 transition-colors flex items-center justify-center ${
                        resolveIconKey(user.emoji) === key
                          ? 'bg-olive-100 border-2 border-olive-500 text-olive-600'
                          : 'border-2 border-transparent text-brown-500 hover:text-olive-600'
                      }`}
                    >
                      <Icon className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="container-xl py-10 md:py-14">

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {fetchLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        )}

        {!fetchLoading && bookings.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking, i) => (
              <BookingCard key={booking._id ?? i} booking={booking} />
            ))}
          </div>
        )}

        {!fetchLoading && bookings.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mb-5">
              <Flower size={36} className="text-olive-500 fill-olive-200" />
            </div>
            <h2 className="text-xl font-serif font-bold text-brown-700 mb-2">You have no bookings yet.</h2>
            <p className="text-brown-400 text-sm mb-7 max-w-xs">
              Ready to book a beautiful mehndi session? We&apos;d love to create something special for you.
            </p>
            <Link href="/contact" className="btn-primary">
              Book Now <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
