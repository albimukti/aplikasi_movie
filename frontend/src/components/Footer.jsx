import React from 'react';
import { Film, Heart, ShieldCheck, Radio } from 'lucide-react';

export const Footer = ({ setActiveView }) => {
  return (
    <footer className="bg-cinema-950 border-t border-cinema-border/60 pt-10 sm:pt-16 pb-24 md:pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cinema-red to-cinema-red-dark flex items-center justify-center shadow-3d-red">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-2xl text-white tracking-wider">
                MOVIE<span className="text-cinema-red">HUB</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Platform streaming film premium dengan dukungan resolusi 4K Ultra HD, kompresi multi-profil cerdas, terjemahan subtitle multibahasa, dan sistem monetisasi iklan modern.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sistem Aktif • PostgreSQL 18 & Go Fiber Gateway</span>
            </div>
          </div>

          {/* Navigasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => setActiveView('catalog')} className="hover:text-cinema-red transition-colors">
                  Katalog Film 4K
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('support')} className="hover:text-cinema-red transition-colors">
                  Dukung Kami via QRIS
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('admin')} className="hover:text-amber-400 transition-colors">
                  Content Ops Admin Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('superadmin')} className="hover:text-cinema-red transition-colors">
                  Super Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Arsitektur Teknologi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Arsitektur Spesifikasi
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-zinc-300">
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">React JS 19</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">Tailwind CSS</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">Golang Fiber</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">PostgreSQL 18</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">Redis Cache</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">FFmpeg 4K</span>
              <span className="px-2.5 py-1 rounded-md bg-cinema-850 border border-zinc-800">JWT + CAPTCHA</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} MovieHub Streaming Platform. Dibuat sesuai blueprint teknis dokumentasi implementasi.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Privasi</span>
            <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Ketentuan Layanan</span>
            <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Dokumentasi API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
