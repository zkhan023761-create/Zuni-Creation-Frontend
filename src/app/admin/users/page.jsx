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
  pending:   'bg-adminGreen-50 text-adminGreen-700',
  confirmed: 'bg-adminGreen-100 text-adminGreen-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-50 text-red-500',
};

function UserRow({ user }) {
  const [expanded, setExpanded] = useState(false);
  const b = user.bookings || {};

  return (
    <>
      <tr
        className="hover:bg-gray-50/60 transition-colors cursor-pointer border-b border-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar + Name */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-adminGreen-50 rounded-full flex items-center justify-center shrink-0 border border-adminGreen-100">
              <ProfileIcon name={user.emoji} className="w-5 h-5 text-adminGreen-600 fill-adminGreen-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{user.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          {user.isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100">
              <CheckCircle className="w-3.5 h-3.5" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
              <XCircle className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </td>

        {/* Bookings */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-bold text-gray-900">{b.total ?? 0}</span>
            {b.total > 0 && (
              <span className="text-xs text-gray-500 font-medium">
                ({b.pending ?? 0} pending)
              </span>
            )}
          </div>
        </td>

        {/* Joined */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
            <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
            {formatDate(user.createdAt)}
          </div>
        </td>

        {/* Last active */}
        <td className="px-5 py-4 text-gray-500 text-sm font-medium">
          {formatDate(user.updatedAt)}
        </td>

        {/* Expand toggle */}
        <td className="px-5 py-4">
          <button className="text-gray-400 hover:text-adminGreen-600 transition-colors p-2 hover:bg-gray-100 rounded-xl">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-gray-50/50">
          <td colSpan={6} className="px-5 py-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Account info */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">Joined {formatDateTime(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">Updated {formatDateTime(user.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <span className="text-xs font-bold text-gray-400">ID:</span>
                    <span className="font-mono text-xs text-gray-500 truncate">{user._id}</span>
                  </div>
                </div>
              </div>

              {/* Booking stats */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Bookings</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total',     value: b.total ?? 0,     color: 'text-gray-900' },
                    { label: 'Pending',   value: b.pending ?? 0,   color: 'text-adminGreen-600'  },
                    { label: 'Confirmed', value: b.confirmed ?? 0, color: 'text-adminGreen-600' },
                    { label: 'Completed', value: b.completed ?? 0, color: 'text-gray-600' },
                    { label: 'Cancelled', value: b.cancelled ?? 0, color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className={`font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Profile</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-adminGreen-50 rounded-full flex items-center justify-center border border-adminGreen-100">
                    <ProfileIcon name={user.emoji} className="w-7 h-7 text-adminGreen-600 fill-adminGreen-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{user.name}</p>
                    <p className="text-xs font-medium text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-gray-500 font-medium">Verification:</span>
                  {user.isVerified ? (
                    <span className="text-adminGreen-600 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Email verified
                    </span>
                  ) : (
                    <span className="text-gray-500 font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Not verified
                    </span>
                  )}
                </div>
              </div>

              {/* Booking status breakdown visual */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activity</p>
                {(b.total ?? 0) === 0 ? (
                  <p className="text-gray-500 text-sm font-medium">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: 'Pending',   value: b.pending ?? 0,   bg: 'bg-yellow-400'  },
                      { label: 'Confirmed', value: b.confirmed ?? 0, bg: 'bg-adminGreen-500' },
                      { label: 'Completed', value: b.completed ?? 0, bg: 'bg-gray-400' },
                      { label: 'Cancelled', value: b.cancelled ?? 0, bg: 'bg-red-400' },
                    ].map(({ label, value, bg }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 font-medium mb-1.5">
                          <span>{label}</span><span className="font-bold">{value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
          <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
          <p className="text-gray-500 text-sm mt-1">All customer accounts — click any row to expand details</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',    value: users.length,       icon: Users,        color: 'text-adminGreen-600', bg: 'bg-adminGreen-50',  border: 'border-adminGreen-100' },
          { label: 'Verified',       value: totalVerified,      icon: CheckCircle,  color: 'text-adminGreen-600', bg: 'bg-adminGreen-50',  border: 'border-adminGreen-100' },
          { label: 'Pending OTP',    value: totalUnverified,    icon: XCircle,      color: 'text-gray-500', bg: 'bg-gray-50',  border: 'border-gray-200' },
          { label: 'Have Bookings',  value: totalWithBookings,  icon: BookOpen,     color: 'text-gray-600', bg: 'bg-gray-50',  border: 'border-gray-200' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}>
            <div className={`p-2.5 rounded-xl bg-white/50 border ${border}`}>
              <Icon className={`w-6 h-6 ${color} shrink-0`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${color} leading-none`}>{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-400 bg-white font-medium text-gray-900 placeholder:text-gray-400"
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
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                filter === key
                  ? 'bg-adminGreen-500 text-white shadow-adminGreen-500/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center">
          <span className="w-10 h-10 border-2 border-adminGreen-100 border-t-adminGreen-500 rounded-full animate-spin inline-block" />
          <p className="text-gray-500 font-medium mt-4">Loading users...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-900 font-bold text-lg">No users found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map(user => <UserRow key={user._id} user={user} />)}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {filtered.map(user => {
              const b = user.bookings || {};
              return (
                <div key={user._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-adminGreen-50 rounded-full flex items-center justify-center shrink-0 border border-adminGreen-100">
                      <ProfileIcon name={user.emoji} className="w-6 h-6 text-adminGreen-600 fill-adminGreen-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-base truncate">{user.name}</p>
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100 shrink-0">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 shrink-0">
                            <XCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm font-medium truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{b.total ?? 0}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-adminGreen-600">{b.confirmed ?? 0}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Confirmed</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-500">{b.completed ?? 0}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Completed</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-4 text-center bg-gray-50 py-2 rounded-xl">Joined {formatDate(user.createdAt)}</p>
                </div>
              );
            })}
          </div>

          <p className="text-sm font-bold text-gray-400 mt-6 text-center">
            Showing {filtered.length} of {users.length} users
          </p>
        </>
      )}
    </div>
  );
}
