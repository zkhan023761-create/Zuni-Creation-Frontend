'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Flower } from 'lucide-react';
import { userAuthAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep]         = useState(1); // 1 = details, 2 = OTP
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await userAuthAPI.register({ name, email, password });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await userAuthAPI.verifyOtp({ email, otp });
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      router.push('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true); setError('');
    try {
      await userAuthAPI.register({ name, email, password });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 via-cream to-olive-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-olive-600 to-olive-500 px-8 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <Flower size={26} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Create Account</h1>
            <p className="text-olive-100 text-sm mt-1">Join Zuniii Creation</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center px-8 pt-6 gap-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  step >= s ? 'bg-olive-500 text-white' : 'bg-beige-100 text-brown-400'
                }`}>{s}</div>
                <span className={`text-xs font-medium ${step >= s ? 'text-olive-600' : 'text-brown-300'}`}>
                  {s === 1 ? 'Your Details' : 'Verify Email'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-olive-400' : 'bg-beige-200'}`} />}
              </div>
            ))}
          </div>

          <div className="p-8 pt-5">
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-brown-600 font-medium mb-1.5 text-sm">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm"
                      placeholder="Your full name" />
                  </div>
                </div>
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
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                      className="w-full pl-10 pr-10 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-sm"
                      placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Continue <ArrowRight size={16} /></>}
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-brown-500 text-sm">We sent a 6-digit code to</p>
                  <p className="text-brown-700 font-semibold">{email}</p>
                </div>
                <div>
                  <label className="block text-brown-600 font-medium mb-1.5 text-sm text-center">Enter OTP</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                    className="w-full px-4 py-4 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 text-center tracking-[0.6em] font-mono text-2xl"
                    placeholder="• • • • • •" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Verify & Create Account <ArrowRight size={16} /></>}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                    className="text-brown-400 hover:text-brown-600">← Back</button>
                  <button type="button" onClick={handleResend} disabled={loading}
                    className="text-olive-500 hover:underline disabled:opacity-50">Resend OTP</button>
                </div>
              </form>
            )}

            <p className="text-center text-brown-400 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-olive-500 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
