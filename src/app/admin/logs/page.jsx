'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, RefreshCcw, Calendar, ShoppingBag, Scissors, Image, Shield, ChevronDown } from 'lucide-react';
import { logsAPI } from '@/lib/api';

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'bookings', label: 'Bookings',  color: '#4a7c59', bg: 'bg-emerald-50',  text: 'text-emerald-700',  icon: ShoppingBag },
  { key: 'services', label: 'Services',  color: '#6366f1', bg: 'bg-indigo-50',   text: 'text-indigo-700',   icon: Scissors },
  { key: 'gallery',  label: 'Gallery',   color: '#f59e0b', bg: 'bg-amber-50',    text: 'text-amber-700',    icon: Image },
  { key: 'security', label: 'Changes',   color: '#ef4444', bg: 'bg-red-50',      text: 'text-red-700',      icon: Shield },
];

const ACTION_LABELS = {
  booking_created:        { label: 'Booking Created',       color: 'bg-emerald-100 text-emerald-700' },
  booking_status_changed: { label: 'Booking Updated',       color: 'bg-emerald-50  text-emerald-600' },
  service_added:          { label: 'Service Added',          color: 'bg-indigo-100  text-indigo-700' },
  service_updated:        { label: 'Service Updated',        color: 'bg-indigo-50   text-indigo-600' },
  service_deleted:        { label: 'Service Deleted',        color: 'bg-red-100     text-red-700' },
  gallery_added:          { label: 'Gallery Added',          color: 'bg-amber-100   text-amber-700' },
  gallery_deleted:        { label: 'Gallery Deleted',        color: 'bg-amber-50    text-amber-600' },
  password_changed:       { label: 'Password Changed',       color: 'bg-red-100     text-red-700' },
  admin_profile_updated:  { label: 'Admin Profile Updated',  color: 'bg-purple-100  text-purple-700' },
  user_password_changed:  { label: 'User Password Changed',  color: 'bg-orange-100  text-orange-700' },
  user_registered:        { label: 'User Registered',        color: 'bg-sky-100     text-sky-700' },
  user_profile_updated:   { label: 'User Profile Updated',   color: 'bg-sky-50      text-sky-600' },
};

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const maxTotal = Math.max(...data.map(d => CATEGORIES.reduce((s, c) => s + (d[c.key] || 0), 0)), 1);
  const chartH = 180;
  const barW   = 40;
  const gap    = 20;
  const padL   = 8;
  const totalW = padL + data.length * (barW + gap);

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cat.color }} />
            {cat.label}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg width={totalW} height={chartH + 32} className="overflow-visible">
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map(frac => (
            <g key={frac}>
              <line
                x1={0} y1={chartH * (1 - frac)}
                x2={totalW} y2={chartH * (1 - frac)}
                stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4"
              />
              <text x={0} y={chartH * (1 - frac) - 3} fontSize={9} fill="#9ca3af">
                {Math.round(frac * maxTotal)}
              </text>
            </g>
          ))}

          {data.map((item, i) => {
            const x = padL + i * (barW + gap);
            let yOffset = chartH;
            const total = CATEGORIES.reduce((s, c) => s + (item[c.key] || 0), 0);

            return (
              <g key={i}>
                {CATEGORIES.map(cat => {
                  const value = item[cat.key] || 0;
                  if (value === 0) return null;
                  const bH = (value / maxTotal) * chartH;
                  yOffset -= bH;
                  return (
                    <rect
                      key={cat.key}
                      x={x} y={yOffset}
                      width={barW} height={bH}
                      fill={cat.color}
                      rx={2}
                      opacity={0.9}
                    />
                  );
                })}

                {/* Rounded top cap */}
                {total > 0 && (() => {
                  const topY = chartH - (total / maxTotal) * chartH;
                  return (
                    <>
                      <rect x={x} y={topY} width={barW} height={6} fill={CATEGORIES.find(c => (item[c.key] || 0) > 0)?.color || '#ccc'} rx={3} opacity={0.9} />
                      <text x={x + barW / 2} y={topY - 5} textAnchor="middle" fontSize={10} fill="#374151" fontWeight="700">{total}</text>
                    </>
                  );
                })()}

                {/* Day label */}
                <text x={x + barW / 2} y={chartH + 20} textAnchor="middle" fontSize={11} fill="#6b7280" fontWeight="600">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, bg, text }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} className={text} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [actRes, statsRes] = await Promise.all([
        logsAPI.getActivityLogs(),
        logsAPI.getActivityStats(),
      ]);
      setLogs(actRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const ACTION_GROUPS = {
    Bookings: ['booking_created', 'booking_status_changed'],
    Services: ['service_added', 'service_updated', 'service_deleted'],
    Gallery:  ['gallery_added', 'gallery_deleted'],
    Security: ['password_changed', 'admin_profile_updated', 'user_password_changed', 'user_registered', 'user_profile_updated'],
  };

  const filteredLogs = filter === 'All' ? logs : logs.filter(l => ACTION_GROUPS[filter]?.includes(l.action));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-600" /> Activity Logs
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Full audit trail of all website changes</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Events"   value={stats?.totals?.total}    Icon={FileText}     bg="bg-gray-50"    text="text-gray-500" />
        <StatCard label="Booking Events" value={stats?.totals?.bookings} Icon={ShoppingBag}  bg="bg-emerald-50" text="text-emerald-600" />
        <StatCard label="Service Events" value={stats?.totals?.services} Icon={Scissors}     bg="bg-indigo-50"  text="text-indigo-600" />
        <StatCard label="Gallery Events" value={stats?.totals?.gallery}  Icon={Image}        bg="bg-amber-50"   text="text-amber-600" />
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={16} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Activity — Last 7 Days</h2>
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-100 border-t-gray-400 rounded-full animate-spin" />
          </div>
        ) : stats?.days ? (
          <BarChart data={stats.days} />
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No chart data available.</p>
        )}
      </div>

      {/* Activity Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">All Events</h2>
          {/* Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="appearance-none pr-8 pl-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none cursor-pointer"
            >
              {['All', 'Bookings', 'Services', 'Gallery', 'Security'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading events...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">No events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                  <th className="px-6 py-3 font-semibold">Actor</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                  <th className="px-6 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map(log => {
                  const cfg = ACTION_LABELS[log.action] || { label: log.action.replace(/_/g, ' '), color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-xs text-gray-400 font-medium whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-gray-700 text-xs">{log.user || '—'}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs max-w-xs truncate">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
