'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Send, Eye, EyeOff, UserPlus, ShieldCheck, User, Phone } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { userAuthAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Tabs config
const TABS = [
  { key: 'password', label: 'Login' },
  { key: 'register', label: 'Register' },
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
  const redirectTo = searchParams.get('redirect') || '/my-bookings';

  const [tab, setTab]           = useState(initialTab);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
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
      setPassword(process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '');
    } else {
      setEmail('');
      setPassword('');
    }
    setError(''); setInfo(''); setOtpSent(false); setOtp(''); setName(''); setPhone('');
    setIsResettingPassword(false); setResetOtpSent(false); setNewPassword('');
  }, [tab]);

  // ── Customer Registration ────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await userAuthAPI.register({ name, email, phone, password });
      setInfo('OTP sent to your email. Please verify to complete registration.');
      setTab('otp');
      setOtpSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed.'));
    } finally { setLoading(false); }
  }

  // ── Google Login ─────────────────────────────────────────────────────────
  // /api/auth/google returns { token, refreshToken, user } (uses 'token' not 'accessToken')
  async function handleGoogleSuccess(credentialResponse) {
    setLoading(true); setError('');
    try {
      const res = await authAPI.googleLogin({ credential: credentialResponse.credential });
      const { token, refreshToken, user } = res.data;
      if (!token) throw new Error('No token received from Google login');
      // AuthContext.login() stores tokens under userToken / userRefreshToken keys
      login(token, refreshToken, user);
      router.push(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err, 'Google login failed. Please try again.'));
    } finally { setLoading(false); }
  }

  // ── Password login (Customer & Admin) ────────────────────────────────────
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@zuniii.com').toLowerCase();
      
      if (email.toLowerCase() === adminEmail) {
        const res = await authAPI.login({ email, password });
        localStorage.setItem('token',        res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('admin',        JSON.stringify(res.data.user));
        router.push('/admin/dashboard');
        return;
      }

      const res = await userAuthAPI.loginPassword({ email, password });
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      router.push(redirectTo);
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
      router.push(redirectTo);
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
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-4 relative pt-20">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-beige-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Header */}
          <div className="px-8 py-8 text-center border-b border-beige-100 bg-gradient-to-b from-beige-50/50 to-white">
            <div className="w-14 h-14 mx-auto mb-4 bg-olive-50 border border-olive-100 rounded-2xl flex items-center justify-center text-olive-600">
              {isAdmin ? <ShieldCheck size={28} /> : <User size={28} />}
            </div>
            <h1 className="text-2xl font-serif font-bold text-brown-700">
              {tab === 'register' ? 'Create Account' : isAdmin ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="text-brown-400 text-sm mt-1.5">
              {tab === 'register' ? 'Join Zuniii to book appointments' : isAdmin ? 'Secure Access' : 'Sign in to your account'}
            </p>
          </div>

          <div className="p-8">
            {!isResettingPassword && (
              /* Tabs */
              <div className="flex bg-beige-50 rounded-xl p-1 mb-8 border border-beige-100">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      tab === key
                        ? 'bg-white text-brown-700 shadow-sm border border-beige-200'
                        : 'text-brown-400 hover:text-brown-600'
                    }`}
                  >
                    {key === 'admin' && <ShieldCheck size={14} />}
                    {label}
                  </button>
                ))}
              </div>
            )}

            {!isResettingPassword && !isAdmin && tab !== 'otp' && (
              <>
                <div className="mb-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google login failed.')}
                  />
                </div>
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-beige-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-brown-400">Or continue with</span>
                  </div>
                </div>
              </>
            )}

            {/* Error / Info */}
            {error && <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">{error}</div>}
            {info  && <div className="mb-6 p-3 bg-olive-50 border border-olive-100 rounded-xl text-olive-600 text-sm text-center">{info}</div>}

            {isResettingPassword ? (
              /* ── Reset Password OTP Form ── */
              <form onSubmit={resetOtpSent ? handleResetPassword : handleSendResetOtp} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-brown-700">Reset Password</h3>
                  <button type="button" onClick={() => { setIsResettingPassword(false); setError(''); setInfo(''); }}
                    className="text-sm text-brown-400 hover:text-olive-600 transition-colors">
                    ← Back
                  </button>
                </div>

                <div>
                  <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={resetOtpSent}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 disabled:bg-beige-50 disabled:text-brown-400 transition-all"
                      placeholder="your@email.com" />
                  </div>
                </div>

                {resetOtpSent && (
                  <>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Enter Reset OTP</label>
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                        className="w-full px-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 text-center tracking-[0.5em] font-mono text-lg transition-all"
                        placeholder="• • • • • •" />
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                          className="w-full pl-11 pr-11 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="At least 6 characters" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-300 hover:text-olive-600 transition-colors">
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : resetOtpSent ? 'Reset Password' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <>
                {/* ── Register tab ── */}
                {tab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Full Name</label>
                      <div className="relative">
                        <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="+1 234 567 8900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                          className="w-full pl-11 pr-11 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="Create a password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-300 hover:text-olive-600 transition-colors">
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 mt-2 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
                    </button>
                  </form>
                )}

                {/* ── Password tab ── */}
                {tab === 'password' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-brown-600 font-medium text-sm">Password</label>
                        <button type="button" onClick={() => { setIsResettingPassword(true); setError(''); setInfo(''); }}
                          className="text-xs text-brown-400 hover:text-olive-600 transition-colors font-medium">
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                          className="w-full pl-11 pr-11 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="Enter your password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-300 hover:text-olive-600 transition-colors">
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 mt-2 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
                    </button>
                  </form>
                )}

                {/* ── OTP tab ── */}
                {tab === 'otp' && (
                  <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 disabled:bg-beige-50 disabled:text-brown-400 transition-all"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    {otpSent && (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-brown-600 font-medium text-sm">Enter OTP</label>
                          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setInfo(''); }}
                            className="text-xs text-brown-400 hover:text-olive-600 transition-colors font-medium">
                            Change Email
                          </button>
                        </div>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                          className="w-full px-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 text-center tracking-[0.5em] font-mono text-lg transition-all"
                          placeholder="• • • • • •" />
                      </div>
                    )}
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 mt-2 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading
                        ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : otpSent ? 'Verify OTP' : <><Send size={18} /> Send OTP</>}
                    </button>
                  </form>
                )}

                {/* ── Admin tab ── */}
                {tab === 'admin' && (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="admin@zuniii.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-1.5 text-sm">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" />
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                          className="w-full pl-11 pr-11 py-3 bg-white border border-beige-200 rounded-xl focus:outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-400 text-brown-700 transition-all"
                          placeholder="Enter admin password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-300 hover:text-olive-600 transition-colors">
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 mt-2 bg-brown-700 hover:bg-brown-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading
                        ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><ShieldCheck size={18} /> Sign In</>}
                    </button>
                  </form>
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
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <Suspense fallback={<div className="min-h-screen bg-beige-50" />}>
        <LoginForm />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
