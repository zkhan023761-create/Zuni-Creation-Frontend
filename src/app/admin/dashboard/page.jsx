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
  pending:   'bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100',
  confirmed: 'bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100',
  completed: 'bg-gray-50 text-gray-600 border border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-100',
};

const quickActions = [
  { label: 'Bookings',     href: '/admin/bookings',     icon: Calendar,      bg: 'bg-gray-50 hover:bg-adminGreen-50',  icon_color: 'text-adminGreen-600'  },
  { label: 'Services',     href: '/admin/services',     icon: Scissors,      bg: 'bg-gray-50 hover:bg-gray-100',        icon_color: 'text-gray-600'  },
  { label: 'Users',        href: '/admin/users',        icon: Users,         bg: 'bg-gray-50 hover:bg-adminGreen-50',  icon_color: 'text-adminGreen-600'  },
  { label: 'Gallery',      href: '/admin/gallery',      icon: Image,         bg: 'bg-gray-50 hover:bg-adminGreen-50',  icon_color: 'text-adminGreen-600'   },
  { label: 'Messages',     href: '/admin/contact',      icon: MessageSquare, bg: 'bg-gray-50 hover:bg-gray-100',        icon_color: 'text-gray-500'  },
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
    { label: 'Total Bookings',  value: bookings.length,                                        icon: Calendar,      iconBg: 'bg-adminGreen-50',  iconColor: 'text-adminGreen-600' },
    { label: 'Pending',         value: bookings.filter(b => b.status === 'pending').length,    icon: Clock,         iconBg: 'bg-adminGreen-50',   iconColor: 'text-adminGreen-600'  },
    { label: 'Confirmed',       value: bookings.filter(b => b.status === 'confirmed').length,  icon: CheckCircle,   iconBg: 'bg-adminGreen-50',  iconColor: 'text-adminGreen-600' },
    { label: 'Unread Messages', value: unreadCount,                                            icon: MessageSquare, iconBg: 'bg-gray-50',  iconColor: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {showChangePassword && adminUser && (
        <ChangePasswordModal email={adminUser.email} onClose={() => setShowChangePassword(false)} />
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your business at a glance.</p>
        </div>

        {/* Profile card */}
        {adminUser && (
          <div className="relative flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-3 shrink-0 self-start">
            <button onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-10 h-10 bg-adminGreen-50 rounded-xl flex items-center justify-center hover:bg-adminGreen-100 transition-colors shrink-0"
              disabled={updatingIcon}>
              {updatingIcon
                ? <span className="w-4 h-4 border-2 border-adminGreen-500 border-t-transparent rounded-full animate-spin" />
                : <ProfileIcon name={adminUser.emoji} className="w-5 h-5 text-adminGreen-600 fill-adminGreen-600" />}
            </button>
            <div>
              <p className="font-bold text-gray-900 text-sm">{adminUser.name}</p>
              <div className="flex gap-3 mt-0.5">
                <button onClick={() => setShowIconPicker(!showIconPicker)} className="text-xs text-adminGreen-600 hover:text-adminGreen-700 font-semibold">Change Icon</button>
                <button onClick={() => setShowChangePassword(true)} className="text-xs text-gray-400 hover:text-gray-600 font-semibold flex items-center gap-1"><Lock size={10} /> Password</button>
              </div>
            </div>

            {showIconPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 w-60">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Icon</span>
                  <button onClick={() => setShowIconPicker(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PROFILE_ICONS.map(({ key, Icon }) => (
                    <button key={key} onClick={() => handleSelectIcon(key)}
                      className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                        resolveIconKey(adminUser.emoji) === key
                          ? 'bg-adminGreen-50 border-2 border-adminGreen-400 text-adminGreen-600'
                          : 'border-2 border-transparent text-gray-400 hover:bg-gray-50'
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center mb-5`}>
              <s.icon className={`w-6 h-6 ${s.iconColor}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              {loading ? <span className="text-gray-300">—</span> : s.value}
            </div>
            <div className="text-sm font-medium text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Recent bookings */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 text-lg">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-semibold text-adminGreen-600 hover:text-adminGreen-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse bg-gray-50" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between py-4 group hover:bg-gray-50/50 transition-colors -mx-2 px-2 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-adminGreen-50 flex items-center justify-center text-sm font-bold text-adminGreen-700 shrink-0">
                      {b.customerName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{b.customerName}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{new Date(b.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusBadge[b.status] || statusBadge.pending}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900 text-lg mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Link key={action.label} href={action.href}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl ${action.bg} transition-colors border border-transparent hover:border-gray-200`}>
                <action.icon className={`w-6 h-6 ${action.icon_color}`} />
                <span className={`text-xs font-bold ${action.icon_color}`}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
