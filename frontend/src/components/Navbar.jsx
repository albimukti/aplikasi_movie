import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Film, ShieldCheck, Clapperboard, HeartHandshake, LogIn, LogOut, 
  Search, Menu, X, MonitorPlay, UserPlus, Sparkles
} from 'lucide-react';

export const Navbar = ({ activeView, setActiveView, searchQuery, setSearchQuery, onSearchFocus }) => {
  const { user, role, isAuthenticated, logout, setAuthModalOpen, setAuthMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-cinema-950/90 backdrop-blur-xl border-b border-cinema-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Main Navigation */}
          <div className="flex items-center gap-3 sm:gap-8">
            <button 
              onClick={() => {
                setActiveView('catalog');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer shrink-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cinema-red-light via-cinema-red to-cinema-red-dark flex items-center justify-center shadow-3d-red group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-black text-xl sm:text-2xl tracking-wider text-white flex items-center gap-0.5 sm:gap-1">
                  MOVIE<span className="text-cinema-red text-glow-red">HUB</span>
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-zinc-400 block -mt-1 hidden xs:block">
                  Cinema 4K Ultra HD
                </span>
              </div>
            </button>

            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setActiveView('catalog')}
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'catalog'
                    ? 'text-white bg-cinema-800 border border-cinema-red/30 shadow-inner-glow'
                    : 'text-zinc-400 hover:text-white hover:bg-cinema-850'
                }`}
              >
                <MonitorPlay className="w-4 h-4 text-cinema-red" />
                <span>Katalog Film</span>
              </button>

              <button
                onClick={() => setActiveView('support')}
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'support'
                    ? 'text-white bg-cinema-800 border border-cinema-red/30 shadow-inner-glow'
                    : 'text-zinc-400 hover:text-white hover:bg-cinema-850'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>Dukung QRIS</span>
              </button>

              {/* Super Admin Dashboard Button (Only when logged in as SUPERADMIN) */}
              {isAuthenticated && role === 'SUPERADMIN' && (
                <button
                  onClick={() => setActiveView('superadmin')}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeView === 'superadmin'
                      ? 'text-white bg-gradient-to-r from-cinema-red-deep to-cinema-800 border border-cinema-red shadow-3d-red'
                      : 'text-rose-300 hover:text-white hover:bg-cinema-red-deep/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cinema-red-light animate-pulse" />
                  <span className="font-semibold">Super Admin Console</span>
                </button>
              )}

              {/* Admin Dashboard Button (Only when logged in as ADMIN or SUPERADMIN) */}
              {isAuthenticated && (role === 'ADMIN' || role === 'SUPERADMIN') && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeView === 'admin'
                      ? 'text-white bg-amber-950/40 border border-amber-500/50 shadow-inner-glow'
                      : 'text-amber-300 hover:text-white hover:bg-amber-950/20'
                  }`}
                >
                  <Clapperboard className="w-4 h-4 text-amber-400" />
                  <span>Content Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-xs md:max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari judul film, genre, 4K..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cinema-850 border border-cinema-border/70 rounded-full pl-10 pr-12 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red focus:ring-1 focus:ring-cinema-red transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: User Profile or Login/Register */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
              className="sm:hidden p-2 rounded-xl bg-cinema-850 text-zinc-400 hover:text-white border border-zinc-800"
              title="Cari Film"
            >
              <Search className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 pl-1 sm:pl-2">
                  <img
                    src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                    alt={user?.name || "User"}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-cinema-red shadow-sm shrink-0"
                  />
                  <div className="hidden xl:block text-left text-xs">
                    <div className="font-semibold text-white truncate max-w-[130px]">{user?.name}</div>
                    <div className="text-[10px] font-bold text-cinema-red tracking-wider uppercase">{user?.role}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 sm:p-2.5 rounded-xl bg-cinema-850 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors cursor-pointer"
                  title="Keluar (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="hidden md:flex px-3.5 py-2 rounded-xl text-xs font-semibold bg-cinema-850 hover:bg-cinema-800 border border-zinc-700/60 text-zinc-300 hover:text-white items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>

                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold red-gradient-btn text-white flex items-center gap-1.5 sm:gap-2 shadow-3d-red cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Masuk</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-cinema-850 text-zinc-400 hover:text-white border border-zinc-800 ml-0.5"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {mobileSearchVisible && (
          <div className="sm:hidden pb-3 pt-1 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik judul film atau genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cinema-850 border border-cinema-red/50 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cinema-red"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              ) : (
                <button
                  onClick={() => setMobileSearchVisible(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cinema-900 border-b border-cinema-border/80 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          
          {/* User Card inside mobile menu */}
          {isAuthenticated ? (
            <div className="p-3 rounded-2xl bg-cinema-850 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                  alt={user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cinema-red"
                />
                <div>
                  <div className="font-bold text-white text-sm">{user?.name}</div>
                  <div className="text-[10px] font-bold text-cinema-red tracking-wider uppercase">
                    ROLE: {user?.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-900/60"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl red-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-3d-red"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk (Login)</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all ${
                activeView === 'catalog'
                  ? 'bg-cinema-800 text-white border border-cinema-red/30'
                  : 'text-zinc-300 hover:bg-cinema-850'
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-cinema-red" />
              <span>Katalog Film 4K</span>
            </button>

            <button
              onClick={() => { setActiveView('support'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all ${
                activeView === 'support'
                  ? 'bg-cinema-800 text-white border border-emerald-500/30'
                  : 'text-zinc-300 hover:bg-cinema-850'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Dukung Kami (QRIS)</span>
            </button>

            {isAuthenticated && role === 'SUPERADMIN' && (
              <button
                onClick={() => { setActiveView('superadmin'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
                  activeView === 'superadmin'
                    ? 'bg-cinema-red text-white shadow-3d-red'
                    : 'text-rose-300 bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cinema-red-light" />
                <span>Super Admin Console</span>
              </button>
            )}

            {isAuthenticated && (role === 'ADMIN' || role === 'SUPERADMIN') && (
              <button
                onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-black shadow-lg font-black'
                    : 'text-amber-300 bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/40'
                }`}
              >
                <Clapperboard className="w-4 h-4 text-amber-400" />
                <span>Content Studio (Admin)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
