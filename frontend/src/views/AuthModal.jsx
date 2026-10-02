import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  X, Lock, Mail, User, ShieldCheck, RefreshCw, 
  LogIn, UserPlus, AlertCircle
} from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // CAPTCHA
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const res = await api.getCaptcha();
      if (res.data) {
        setCaptchaId(res.data.captcha_id);
        setCaptchaSvg(res.data.captcha_svg);
        setCaptchaCode('');
      }
    } catch (err) {
      console.error("Failed to load captcha:", err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (authModalOpen) {
      fetchCaptcha();
      setError('');
    }
  }, [authModalOpen, authMode]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password, captchaId, captchaCode);
      } else {
        await register(name, email, password);
      }
      setAuthModalOpen(false);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan otentikasi');
      // Refresh captcha on failure
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-cinema-900 border border-cinema-red/30 rounded-3xl p-4 sm:p-8 shadow-3d-red space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-cinema-850 hover:bg-cinema-red text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cinema-red-light to-cinema-red-dark flex items-center justify-center mx-auto shadow-3d-red">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            {authMode === 'login' ? 'Masuk ke MovieHub' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            {authMode === 'login' 
              ? 'Silakan masukkan kredensial akun dan kode CAPTCHA Anda' 
              : 'Daftar untuk menikmati koleksi film 4K tanpa batas'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-cinema-850 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMode === 'login' ? 'bg-cinema-red text-white shadow-3d-red' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMode === 'register' ? 'bg-cinema-red text-white shadow-3d-red' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cinema-850 border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">
              {authMode === 'login' ? 'Username atau Email' : 'Alamat Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={authMode === 'login' ? 'text' : 'email'}
                required
                placeholder={authMode === 'login' ? 'Username (superadmin) atau email...' : 'nama@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cinema-850 border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cinema-850 border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          {/* CAPTCHA Section (Required on Login) */}
          {authMode === 'login' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cinema-red" />
                  Verifikasi Keamanan CAPTCHA
                </span>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                  Segarkan Kode
                </button>
              </div>

              {/* Render SVG Captcha */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                <div 
                  className="h-12 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700 bg-cinema-950 flex items-center justify-center p-1"
                  dangerouslySetInnerHTML={{ __html: captchaSvg || '<div class="text-xs text-zinc-500 px-4">Memuat CAPTCHA...</div>' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Ketik kode..."
                  value={captchaCode}
                  onChange={(e) => setCaptchaCode(e.target.value)}
                  className="flex-1 bg-cinema-850 border border-cinema-border rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 uppercase tracking-widest font-mono text-center focus:outline-none focus:border-cinema-red"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl red-gradient-btn text-white font-bold text-sm shadow-3d-red hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : authMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Autofill Hint */}
        {authMode === 'login' && (
          <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-center">
            <span className="text-[11px] text-zinc-400 font-medium">Kredensial Demo (Klik untuk isi cepat):</span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin');
                  setPassword('SuperAdmin123!');
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-900/60 border border-zinc-700/60 hover:border-cinema-red text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                🛡️ <span className="font-bold text-rose-400">superadmin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin');
                  setPassword('Admin123!');
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-amber-900/60 border border-zinc-700/60 hover:border-amber-500 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                🎬 <span className="font-bold text-amber-400">admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user');
                  setPassword('User123!');
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-emerald-900/60 border border-zinc-700/60 hover:border-emerald-500 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                🍿 <span className="font-bold text-emerald-400">user</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
