'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function AdminLoginPage({ onLogin } = {}) {
  const router = useRouter();

  const [email, setEmail]       = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token',        res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('admin',        JSON.stringify(res.data.user));
      if (onLogin) {
        onLogin();
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 via-cream to-olive-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-brown-700 to-brown-600 px-8 py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Admin Portal</h1>
            <p className="text-white/70 text-sm mt-1">Sign in to manage your business</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brown-400 bg-beige-50 focus:bg-white text-sm"
                    placeholder="admin@zuniii.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brown-600 font-medium mb-1.5 text-sm">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brown-400 bg-beige-50 focus:bg-white text-sm"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brown-700 hover:bg-brown-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><ShieldCheck size={16} /> Sign In as Admin</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
