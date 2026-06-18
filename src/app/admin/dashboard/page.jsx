'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Scissors, Image, MessageSquare, Clock, CheckCircle,
  Lock, Send, Eye, EyeOff, X, ArrowRight, Users, Star,
} from 'lucide-react';
import { bookingsAPI, contactAPI, authAPI } from '@/lib/api';
import { PROFILE_ICONS, ProfileIcon, resolveIconKey } from '@/lib/utils';
import { userAuthAPI } from '@/lib/api';

const statusBadge = {
  pending:   'bg-olive-100 text-olive-600',
  confirmed: 'bg-olive-100 text-olive-600',
  completed: 'bg-white/5 text-brown-600',
  cancelled: 'bg-beige-50 text-brown-400',
};

const quickActions = [
  { label: 'Bookings',     href: '/admin/bookings',     icon: Calendar,      bg: 'bg-beige-50',  icon_color: 'text-olive-600'  },
  { label: 'Services',     href: '/admin/services',     icon: Scissors,      bg: 'bg-beige-50',  icon_color: 'text-brown-600'  },
  { label: 'Users',        href: '/admin/users',        icon: Users,         bg: 'bg-beige-50',  icon_color: 'text-olive-600'  },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star,          bg: 'bg-beige-50',  icon_color: 'text-brown-600'  },
  { label: 'Gallery',      href: '/admin/gallery',      icon: Image,         bg: 'bg-beige-50',  icon_color: 'text-olive-600'   },
  { label: 'Messages',     href: '/admin/contact',      icon: MessageSquare, bg: 'bg-beige-50',  icon_color: 'text-brown-500'  },
];

// ── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ email, onClose }) {
  const [step, setStep]               = useState('send');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [info, setInfo]               = useState('');

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await authAPI.sendResetOtp({ email });
      setStep('verify');
      setInfo('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(''); setInfo('');
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setInfo('✅ Password changed!');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-beige-100">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-brown-500" />
            <h2 className="font-semibold text-brown-700">Change Password</h2>
          </div>
          <button onClick={onClose} className="text-brown-300 hover:text-brown-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
          {info  && <div className="p-3 bg-beige-50 border border-olive-100 rounded-xl text-olive-700 text-sm">{info}</div>}
          {step === 'send' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-brown-500 text-sm">Send an OTP to <span className="font-semibold text-brown-700">{email}</span>.</p>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-beige-500 hover:bg-olive-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Send OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">OTP</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                  className="w-full px-4 py-2.5 border border-beige-200 rounded-xl text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-olive-400" autoFocus />
              </div>
              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-300" />
                  <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                    className="w-full pl-9 pr-9 py-2.5 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm" placeholder="At least 6 chars" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setStep('send'); setOtp(''); setError(''); setInfo(''); }}
                  className="flex-1 py-2.5 border border-beige-200 text-brown-500 rounded-xl text-sm hover:bg-beige-50 transition-colors">Resend</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-beige-500 hover:bg-olive-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Change'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [bookings, setBookings]             = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(true);
  const [adminUser, setAdminUser]           = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [updatingIcon, setUpdatingIcon]     = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    try { const stored = localStorage.getItem('admin'); if (stored) setAdminUser(JSON.parse(stored)); } catch {}
  }, []);

  const handleSelectIcon = async (emoji) => {
    setUpdatingIcon(true);
    try {
      const res = await userAuthAPI.updateEmoji({ emoji });
      const updatedAdmin = { ...adminUser, emoji: res.data.emoji };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      setAdminUser(updatedAdmin);
      window.dispatchEvent(new Event('admin-profile-updated'));
      setShowIconPicker(false);
    } catch { alert('Failed to update icon'); } finally { setUpdatingIcon(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, contactRes] = await Promise.all([bookingsAPI.getAll(), contactAPI.getAll()]);
        setBookings(bookRes.data.slice(0, 5));
        setUnreadCount(contactRes.data.filter(c => !c.isRead).length);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Bookings',  value: bookings.length,                                        icon: Calendar,      iconBg: 'bg-olive-100',  iconColor: 'text-olive-600' },
    { label: 'Pending',         value: bookings.filter(b => b.status === 'pending').length,    icon: Clock,         iconBg: 'bg-olive-100',   iconColor: 'text-olive-600'  },
    { label: 'Confirmed',       value: bookings.filter(b => b.status === 'confirmed').length,  icon: CheckCircle,   iconBg: 'bg-olive-100',  iconColor: 'text-olive-600' },
    { label: 'Unread Messages', value: unreadCount,                                            icon: MessageSquare, iconBg: 'bg-white/5',  iconColor: 'text-brown-600' },
  ];

  return (
    <div className="space-y-6">
      {showChangePassword && adminUser && (
        <ChangePasswordModal email={adminUser.email} onClose={() => setShowChangePassword(false)} />
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-700">Dashboard Overview</h1>
          <p className="text-sm text-brown-400 mt-0.5">Welcome back! Here's your business at a glance.</p>
        </div>

        {/* Profile card */}
        {adminUser && (
          <div className="relative flex items-center gap-3 bg-white border border-beige-200 rounded-2xl px-4 py-3 shrink-0 self-start">
            <button onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center hover:bg-olive-500/20 transition-colors shrink-0"
              disabled={updatingIcon}>
              {updatingIcon
                ? <span className="w-4 h-4 border-2 border-olive-500 border-t-transparent rounded-full animate-spin" />
                : <ProfileIcon name={adminUser.emoji} className="w-5 h-5 text-olive-600 fill-olive-600" />}
            </button>
            <div>
              <p className="font-semibold text-brown-700 text-sm">{adminUser.name}</p>
              <div className="flex gap-3 mt-0.5">
                <button onClick={() => setShowIconPicker(!showIconPicker)} className="text-xs text-olive-600 hover:text-brown-700 font-medium">Change Icon</button>
                <button onClick={() => setShowChangePassword(true)} className="text-xs text-brown-400 hover:text-brown-600 font-medium flex items-center gap-1"><Lock size={9} /> Password</button>
              </div>
            </div>

            {showIconPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl p-4 shadow-xl border border-beige-100 w-56">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-beige-100">
                  <span className="text-xs font-bold text-brown-500 uppercase tracking-wide">Select Icon</span>
                  <button onClick={() => setShowIconPicker(false)} className="text-brown-300 hover:text-brown-500 text-lg leading-none">×</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PROFILE_ICONS.map(({ key, Icon }) => (
                    <button key={key} onClick={() => handleSelectIcon(key)}
                      className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                        resolveIconKey(adminUser.emoji) === key
                          ? 'bg-olive-100 border-2 border-olive-400 text-olive-600'
                          : 'border-2 border-transparent text-brown-400 hover:bg-beige-50'
                      }`}>
                      <Icon className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-beige-100 rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div className="text-3xl font-bold text-brown-700 font-serif mb-0.5">
              {loading ? <span className="text-brown-200">—</span> : s.value}
            </div>
            <div className="text-sm text-brown-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Recent bookings */}
        <div className="bg-white border border-beige-100 rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-bold text-brown-700 text-lg">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-olive-600 hover:text-brown-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse bg-beige-50" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-brown-200" />
              <p className="text-sm text-brown-400">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-beige-100">
              {bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-olive-100 flex items-center justify-center text-xs font-bold text-olive-700 shrink-0">
                      {b.customerName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brown-700">{b.customerName}</p>
                      <p className="text-xs text-brown-400">{new Date(b.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[b.status] || statusBadge.pending}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-beige-100 rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-serif font-bold text-brown-700 text-lg mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Link key={action.label} href={action.href}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl ${action.bg} hover:opacity-80 transition-opacity`}>
                <action.icon className={`w-6 h-6 ${action.icon_color}`} />
                <span className={`text-xs font-semibold ${action.icon_color}`}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
