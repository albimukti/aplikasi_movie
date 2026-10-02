import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MonitorPlay, Search, HeartHandshake, Clapperboard, 
  ShieldCheck, User, LogIn 
} from 'lucide-react';

export const BottomNav = ({ activeView, setActiveView, onSearchClick }) => {
  const { user, role, isAuthenticated, setAuthModalOpen, setAuthMode } = useAuth();

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-cinema-950/95 backdrop-blur-2xl border-t border-cinema-border/70 py-1.5 px-3 flex items-center justify-around md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      
      {/* 1. Katalog Film */}
      <button
        onClick={() => setActiveView('catalog')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeView === 'catalog'
            ? 'text-cinema-red font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeView === 'catalog' ? 'bg-cinema-red/15 text-cinema-red' : ''}`}>
          <MonitorPlay className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Katalog</span>
      </button>

      {/* 2. Cari Film */}
      <button
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
      >
        <div className="p-1 rounded-lg">
          <Search className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Cari</span>
      </button>

      {/* 3. Dukung QRIS */}
      <button
        onClick={() => setActiveView('support')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeView === 'support'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeView === 'support' ? 'bg-emerald-500/15 text-emerald-400' : ''}`}>
          <HeartHandshake className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Dukung</span>
      </button>

      {/* 4. Admin Content Studio (when Admin/SuperAdmin) */}
      {isAuthenticated && (role === 'ADMIN' || role === 'SUPERADMIN') && (
        <button
          onClick={() => setActiveView('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'admin'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeView === 'admin' ? 'bg-amber-500/15 text-amber-400' : ''}`}>
            <Clapperboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Studio</span>
        </button>
      )}

      {/* 5. Super Admin Console (when SuperAdmin) */}
      {isAuthenticated && role === 'SUPERADMIN' && (
        <button
          onClick={() => setActiveView('superadmin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'superadmin'
              ? 'text-rose-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeView === 'superadmin' ? 'bg-rose-500/15 text-rose-400' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Console</span>
        </button>
      )}

      {/* 6. Akun / Profil / Masuk */}
      <button
        onClick={handleAuthClick}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isAuthenticated
            ? 'text-cinema-red font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="p-1 rounded-lg">
          {isAuthenticated ? (
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
              alt={user?.name || "User"}
              className="w-5 h-5 rounded-full object-cover border border-cinema-red"
            />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">
          {isAuthenticated ? (user?.role === 'SUPERADMIN' ? 'Super' : user?.role === 'ADMIN' ? 'Admin' : 'Akun') : 'Masuk'}
        </span>
      </button>

    </div>
  );
};
