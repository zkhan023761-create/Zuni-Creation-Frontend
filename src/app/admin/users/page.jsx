'use client';

import { useEffect, useState } from 'react';
import {
  Users, CheckCircle, XCircle, Search, Mail, Calendar,
  BookOpen, Clock, ChevronDown, ChevronUp, Phone,
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ProfileIcon } from '@/lib/utils';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_BADGE = {
  pending:   'bg-gold-100 text-gold-700',
  confirmed: 'bg-olive-100 text-olive-700',
  completed: 'bg-brown-100 text-brown-700',
  cancelled: 'bg-beige-200 text-brown-500',
};

function UserRow({ user }) {
  const [expanded, setExpanded] = useState(false);
  const b = user.bookings || {};

  return (
    <>
      <tr
        className="hover:bg-beige-50/60 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar + Name */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-olive-50 rounded-full flex items-center justify-center shrink-0 border border-olive-100">
              <ProfileIcon name={user.emoji} className="w-4 h-4 text-olive-500 fill-olive-500" />
            </div>
            <div>
              <p className="font-semibold text-brown-700 text-sm leading-tight">{user.name}</p>
              <p className="text-brown-400 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          {user.isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-olive-100 text-olive-700">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-beige-100 text-brown-500">
              <XCircle className="w-3 h-3" /> Pending
            </span>
          )}
        </td>

        {/* Bookings */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-olive-400 shrink-0" />
            <span className="text-sm font-bold text-brown-700">{b.total ?? 0}</span>
            {b.total > 0 && (
              <span className="text-xs text-brown-400">
                ({b.pending ?? 0} pending)
              </span>
            )}
          </div>
        </td>

        {/* Joined */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5 text-brown-400 text-sm">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatDate(user.createdAt)}
          </div>
        </td>

        {/* Last active */}
        <td className="px-5 py-4 text-brown-400 text-sm">
          {formatDate(user.updatedAt)}
        </td>

        {/* Expand toggle */}
        <td className="px-5 py-4">
          <button className="text-brown-400 hover:text-olive-600 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-olive-50/30">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Account info */}
              <div className="bg-white rounded-xl p-4 border border-beige-100">
                <p className="text-xs font-bold text-brown-400 uppercase tracking-wider mb-3">Account</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-brown-600">
                    <Mail className="w-3.5 h-3.5 text-olive-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brown-600">
                    <Calendar className="w-3.5 h-3.5 text-olive-400 shrink-0" />
                    <span>Joined {formatDateTime(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brown-600">
                    <Clock className="w-3.5 h-3.5 text-olive-400 shrink-0" />
                    <span>Updated {formatDateTime(user.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brown-600">
                    <span className="text-xs text-brown-400">ID:</span>
                    <span className="font-mono text-xs text-brown-500 truncate">{user._id}</span>
                  </div>
                </div>
              </div>

              {/* Booking stats */}
              <div className="bg-white rounded-xl p-4 border border-beige-100">
                <p className="text-xs font-bold text-brown-400 uppercase tracking-wider mb-3">Bookings</p>
                <div className="space-y-2">
                  {[
                    { label: 'Total',     value: b.total ?? 0,     color: 'text-brown-700' },
                    { label: 'Pending',   value: b.pending ?? 0,   color: 'text-gold-600'  },
                    { label: 'Confirmed', value: b.confirmed ?? 0, color: 'text-olive-600' },
                    { label: 'Completed', value: b.completed ?? 0, color: 'text-brown-600' },
                    { label: 'Cancelled', value: b.cancelled ?? 0, color: 'text-brown-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-brown-500">{label}</span>
                      <span className={`font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile */}
              <div className="bg-white rounded-xl p-4 border border-beige-100">
                <p className="text-xs font-bold text-brown-400 uppercase tracking-wider mb-3">Profile</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-olive-50 rounded-full flex items-center justify-center border border-olive-100">
                    <ProfileIcon name={user.emoji} className="w-6 h-6 text-olive-500 fill-olive-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-brown-700 text-sm">{user.name}</p>
                    <p className="text-xs text-brown-400">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-brown-400">Verification:</span>
                  {user.isVerified ? (
                    <span className="text-olive-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Email verified
                    </span>
                  ) : (
                    <span className="text-brown-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Not verified
                    </span>
                  )}
                </div>
              </div>

              {/* Booking status breakdown visual */}
              <div className="bg-white rounded-xl p-4 border border-beige-100">
                <p className="text-xs font-bold text-brown-400 uppercase tracking-wider mb-3">Activity</p>
                {(b.total ?? 0) === 0 ? (
                  <p className="text-brown-400 text-sm">No bookings yet</p>
                ) : (
                  <div className="space-y-2">
                    {[
                      { label: 'Pending',   value: b.pending ?? 0,   bg: 'bg-gold-400'  },
                      { label: 'Confirmed', value: b.confirmed ?? 0, bg: 'bg-olive-500' },
                      { label: 'Completed', value: b.completed ?? 0, bg: 'bg-brown-500' },
                      { label: 'Cancelled', value: b.cancelled ?? 0, bg: 'bg-beige-300' },
                    ].map(({ label, value, bg }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-brown-500 mb-1">
                          <span>{label}</span><span>{value}</span>
                        </div>
                        <div className="h-1.5 bg-beige-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bg} rounded-full transition-all`}
                            style={{ width: b.total > 0 ? `${(value / b.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    authAPI.getUsers()
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ||
      (filter === 'verified'   && u.isVerified) ||
      (filter === 'unverified' && !u.isVerified) ||
      (filter === 'booked'     && (u.bookings?.total ?? 0) > 0);
    return matchSearch && matchFilter;
  });

  const totalVerified   = users.filter(u => u.isVerified).length;
  const totalUnverified = users.filter(u => !u.isVerified).length;
  const totalWithBookings = users.filter(u => (u.bookings?.total ?? 0) > 0).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-700">Registered Users</h1>
          <p className="text-brown-400 text-sm mt-0.5">All customer accounts — click any row to expand details</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users',    value: users.length,       icon: Users,        color: 'text-olive-600', bg: 'bg-olive-50',  border: 'border-olive-100' },
          { label: 'Verified',       value: totalVerified,      icon: CheckCircle,  color: 'text-olive-600', bg: 'bg-olive-50',  border: 'border-olive-100' },
          { label: 'Pending OTP',    value: totalUnverified,    icon: XCircle,      color: 'text-brown-500', bg: 'bg-beige-50',  border: 'border-beige-200' },
          { label: 'Have Bookings',  value: totalWithBookings,  icon: BookOpen,     color: 'text-brown-600', bg: 'bg-beige-50',  border: 'border-beige-200' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl px-4 py-3 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{loading ? '—' : value}</p>
              <p className="text-xs text-brown-400 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-beige-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all',        label: 'All' },
            { key: 'verified',   label: 'Verified' },
            { key: 'unverified', label: 'Pending' },
            { key: 'booked',     label: 'Has Bookings' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === key
                  ? 'bg-olive-500 text-white'
                  : 'bg-white border border-beige-200 text-brown-500 hover:bg-beige-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-beige-100 p-10 text-center">
          <span className="w-8 h-8 border-2 border-olive-300 border-t-olive-600 rounded-full animate-spin inline-block" />
          <p className="text-brown-400 text-sm mt-3">Loading users...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige-100 p-12 text-center">
          <Users className="w-12 h-12 text-beige-300 mx-auto mb-3" />
          <p className="text-brown-500 font-medium">No users found</p>
          <p className="text-brown-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-beige-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-beige-100 bg-beige-50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-brown-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-brown-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-brown-400 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-brown-400 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-brown-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-5 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-50">
                {filtered.map(user => <UserRow key={user._id} user={user} />)}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(user => {
              const b = user.bookings || {};
              return (
                <div key={user._id} className="bg-white rounded-2xl border border-beige-100 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center shrink-0 border border-olive-100">
                      <ProfileIcon name={user.emoji} className="w-5 h-5 text-olive-500 fill-olive-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-brown-700 text-sm truncate">{user.name}</p>
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-olive-100 text-olive-700 shrink-0">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-beige-100 text-brown-500 shrink-0">
                            <XCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-brown-400 text-xs truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-beige-50 pt-3">
                    <div>
                      <p className="text-lg font-bold text-brown-700">{b.total ?? 0}</p>
                      <p className="text-xs text-brown-400">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-olive-600">{b.confirmed ?? 0}</p>
                      <p className="text-xs text-brown-400">Confirmed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-brown-500">{b.completed ?? 0}</p>
                      <p className="text-xs text-brown-400">Completed</p>
                    </div>
                  </div>
                  <p className="text-xs text-brown-300 mt-2 text-right">Joined {formatDate(user.createdAt)}</p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-brown-400 mt-3 text-right">
            Showing {filtered.length} of {users.length} users
          </p>
        </>
      )}
    </div>
  );
}
