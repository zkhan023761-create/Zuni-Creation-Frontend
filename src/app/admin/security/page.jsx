'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, RefreshCcw, User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Save, KeyRound, Mail } from 'lucide-react';
import { logsAPI, authAPI } from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const ok = status === 'success';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
      {ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
      {status}
    </span>
  );
}

const ACTION_LABELS = {
  login:                  'Login',
  logout:                 'Logout',
  password_reset_request: 'Password Reset OTP',
  password_reset_success: 'Password Reset',
  profile_updated:        'Profile Updated',
  password_changed:       'Password Changed',
  password_change_failed: 'Password Change Failed',
};

// ── Profile Editor ────────────────────────────────────────────────────────────
function ProfileEditor() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      setName(admin.name  || '');
      setEmail(admin.email || '');
    } catch {}
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return setError('Name cannot be empty');
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await authAPI.updateAdminProfile({ name: name.trim(), email: email.trim() });
      // Update localStorage so sidebar reflects new name immediately
      const existing = JSON.parse(localStorage.getItem('admin') || '{}');
      const updated  = { ...existing, name: res.data.name, email: res.data.email };
      localStorage.setItem('admin', JSON.stringify(updated));
      window.dispatchEvent(new Event('admin-profile-updated'));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <User size={16} className="text-gray-400" />
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Admin Profile</h2>
      </div>
      <div className="p-6 space-y-5">
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={15} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              placeholder="Admin name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              placeholder="admin@email.com"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#4a7c59] hover:bg-[#3d6849] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ── Password Changer ──────────────────────────────────────────────────────────
function PasswordChanger() {
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  const handleChange = async () => {
    if (!currentPw) return setError('Current password is required');
    if (newPw.length < 6)  return setError('New password must be at least 6 characters');
    if (newPw !== confirmPw) return setError('Passwords do not match');
    setSaving(true); setError(''); setSuccess('');
    try {
      await authAPI.changeAdminPassword({ currentPassword: currentPw, newPassword: newPw });
      setSuccess('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const PwInput = ({ value, onChange, show, toggle, placeholder }) => (
    <div className="relative">
      <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Lock size={16} className="text-gray-400" />
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Change Password</h2>
      </div>
      <div className="p-6 space-y-4">
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={15} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
          <PwInput value={currentPw} onChange={setCurrentPw} show={showCur} toggle={() => setShowCur(v => !v)} placeholder="Enter current password" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
          <PwInput value={newPw} onChange={setNewPw} show={showNew} toggle={() => setShowNew(v => !v)} placeholder="Min. 6 characters" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
          <PwInput value={confirmPw} onChange={setConfirmPw} show={showConf} toggle={() => setShowConf(v => !v)} placeholder="Repeat new password" />
          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match</p>
          )}
        </div>

        <button
          onClick={handleChange}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#4a7c59] hover:bg-[#3d6849] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 mt-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}

// ── Security Logs Table ───────────────────────────────────────────────────────
function SecurityLogsTable() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getSecurityLogs();
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Security Log</h2>
          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{logs.length}</span>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-gray-400">Loading security logs...</div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No security events yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">IP / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 font-medium whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-gray-700">
                    {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 font-medium">{log.email}</td>
                  <td className="px-5 py-3"><Badge status={log.status} /></td>
                  <td className="px-5 py-3 text-xs text-gray-400">{log.details || `IP: ${log.ip}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SecurityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" /> Security
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage admin account settings and view security events</p>
      </div>

      {/* Profile + Password — side by side on lg */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ProfileEditor />
        <PasswordChanger />
      </div>

      {/* Security Logs */}
      <SecurityLogsTable />
    </div>
  );
}
