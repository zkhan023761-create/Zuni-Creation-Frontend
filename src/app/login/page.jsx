'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Send, Eye, EyeOff, ArrowRight, ShieldCheck, Flower2 } from 'lucide-react';
import { userAuthAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Tabs config
const TABS = [
  { key: 'password', label: 'Password' },
  { key: 'otp',      label: 'OTP Login' },
  { key: 'admin',    label: 'Admin' },
];

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login }    = useAuth();

  const getErrorMessage = (err, defaultMsg) => {
    if (!err.response) return 'Unable to connect to server. Please ensure the backend is running.';
    return err.response.data?.message || defaultMsg;
  };

  const initialTab = searchParams.get('tab') === 'admin' ? 'admin' : 'password';

  const [tab, setTab]           = useState(initialTab);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');

  // Password reset states
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);

  // Pre-fill admin email from env when switching to admin tab
  useEffect(() => {
    if (tab === 'admin') {
      setEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL || '');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
    setError(''); setInfo(''); setOtpSent(false); setOtp('');
    setIsResettingPassword(false); setResetOtpSent(false); setNewPassword('');
  }, [tab]);

  // ── Customer password login ──────────────────────────────────────────────
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await userAuthAPI.loginPassword({ email, password });
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      router.push('/my-bookings');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally { setLoading(false); }
  }

  // ── Customer OTP send ────────────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await userAuthAPI.sendLoginOtp({ email });
      setOtpSent(true);
      setInfo('OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send OTP.'));
    } finally { setLoading(false); }
  }

  // ── Customer OTP verify ──────────────────────────────────────────────────
  async function handleOtpLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await userAuthAPI.loginOtp({ email, otp });
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      router.push('/my-bookings');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally { setLoading(false); }
  }

  // ── Admin login ──────────────────────────────────────────────────────────
  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token',        res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('admin',        JSON.stringify(res.data.user));
      router.push('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally { setLoading(false); }
  }

  // ── Send Reset Password OTP ──────────────────────────────────────────────
  async function handleSendResetOtp(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await userAuthAPI.sendResetOtp({ email });
      setResetOtpSent(true);
      setInfo('Reset OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send reset OTP.'));
    } finally { setLoading(false); }
  }

  // ── Reset Password ───────────────────────────────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await userAuthAPI.resetPassword({ email, otp, newPassword });
      setInfo('Password reset successfully. You can now sign in.');
      setIsResettingPassword(false);
      setResetOtpSent(false);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password.'));
    } finally { setLoading(false); }
  }

  const isAdmin = tab === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 via-cream to-olive-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className={`px-8 py-8 text-center transition-all duration-300 ${
            isAdmin
              ? 'bg-gradient-to-r from-brown-700 to-brown-600'
              : 'bg-gradient-to-r from-olive-600 to-olive-500'
          }`}>
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              {isAdmin ? <ShieldCheck size={40} className="text-white" /> : <Flower2 size={40} className="text-white" />}
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              {isAdmin ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {isAdmin ? 'Sign in to manage your business' : 'Sign in to your Zuniii Creation account'}
            </p>
          </div>

          <div className="p-8">
            {!isResettingPassword && (
              /* Tabs */
              <div className="flex bg-beige-50 rounded-xl p-1 mb-6">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      tab === key
                        ? key === 'admin'
                          ? 'bg-brown-700 text-white shadow-sm'
                          : 'bg-white text-olive-600 shadow-sm'
                        : 'text-brown-400 hover:text-brown-600'
                    }`}
                  >
                    {key === 'admin' && <ShieldCheck size={13} />}
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Error / Info */}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
            {info  && <div className="mb-4 p-3 bg-olive-50 border border-olive-200 rounded-xl text-olive-700 text-sm">✅ {info}</div>}

            {isResettingPassword ? (
              /* ── Reset Password OTP Form (All users & Admin) ── */
              <form onSubmit={resetOtpSent ? handleResetPassword : handleSendResetOtp} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-serif font-bold text-brown-700">Reset Password</h3>
                  <button type="button" onClick={() => { setIsResettingPassword(false); setError(''); setInfo(''); }}
                    className="text-xs text-olive-500 hover:underline">
                    ← Back to Login
                  </button>
                </div>

                <div>
                  <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={resetOtpSent}
                      className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm disabled:bg-beige-50"
                      placeholder="your@email.com" />
                  </div>
                </div>

                {resetOtpSent && (
                  <>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Enter Reset OTP</label>
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm text-center tracking-[0.5em] font-mono text-lg"
                        placeholder="• • • • • •" />
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
                  </>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    tab === 'admin' ? 'bg-brown-700 hover:bg-brown-800' : 'bg-olive-500 hover:bg-olive-600'
                  }`}>
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : resetOtpSent ? <>Reset Password <ArrowRight size={16} /></> : <><Send size={16} /> Send Reset OTP</>}
                </button>
              </form>
            ) : (
              <>
                {/* ── Password tab (customer) ── */}
                {tab === 'password' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                          className="w-full pl-10 pr-10 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm"
                          placeholder="Enter your password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex justify-end mt-1.5">
                        <button type="button" onClick={() => { setIsResettingPassword(true); setError(''); setInfo(''); }}
                          className="text-xs text-olive-500 hover:underline">
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
                    </button>
                  </form>
                )}

                {/* ── OTP tab (customer) ── */}
                {tab === 'otp' && (
                  <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent}
                          className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm disabled:bg-beige-50"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    {otpSent && (
                      <div>
                        <label className="block text-brown-600 font-medium mb-1.5 text-sm">Enter OTP</label>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                          className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm text-center tracking-[0.5em] font-mono text-lg"
                          placeholder="• • • • • •" />
                        <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setInfo(''); }}
                          className="text-xs text-olive-500 hover:underline mt-1">
                          ← Change email
                        </button>
                      </div>
                    )}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : otpSent ? <>Verify OTP <ArrowRight size={16} /></> : <><Send size={16} /> Send OTP</>}
                    </button>
                  </form>
                )}

                {/* ── Admin tab ── */}
                {tab === 'admin' && (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                          className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brown-400 bg-beige-50 focus:bg-white text-sm"
                          placeholder="admin@zuniii.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                          className="w-full pl-10 pr-10 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brown-400 bg-beige-50 focus:bg-white text-sm"
                          placeholder="Enter admin password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex justify-end mt-1.5">
                        <button type="button" onClick={() => { setIsResettingPassword(true); setError(''); setInfo(''); }}
                          className="text-xs text-brown-600 hover:underline">
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-brown-700 hover:bg-brown-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><ShieldCheck size={16} /> Sign In as Admin</>}
                    </button>
                  </form>
                )}

                {/* Footer links */}
                {!isAdmin && (
                  <p className="text-center text-brown-400 text-sm mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-olive-500 font-semibold hover:underline">Register</Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
