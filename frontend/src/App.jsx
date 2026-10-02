import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { ViewerCatalog } from './views/ViewerCatalog';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { SupportQRISView } from './views/SupportQRISView';
import { PlayerModal } from './components/PlayerModal';
import { MovieDetailModal } from './views/MovieDetailModal';
import { AuthModal } from './views/AuthModal';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

function UnauthorizedNotice({ requiredRole, onLoginClick }) {
  return (
    <div className="max-w-md mx-auto my-12 sm:my-24 p-6 sm:p-8 glass-panel rounded-3xl border border-cinema-red/40 text-center space-y-4 sm:space-y-5 shadow-3d-red animate-in zoom-in-95 mx-4 sm:mx-auto">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cinema-red/20 border border-cinema-red/40 flex items-center justify-center mx-auto text-cinema-red">
        <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
          Akses Memerlukan Autentikasi
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Halaman ini dilindungi dengan kontrol hak akses ketat. Anda harus melewati proses login resmi sebagai <strong className="text-white uppercase">{requiredRole}</strong> untuk dapat mengakses dashboard ini.
        </p>
      </div>

      <button
        onClick={onLoginClick}
        className="w-full py-3 sm:py-3.5 rounded-xl red-gradient-btn text-white font-bold text-xs sm:text-sm shadow-3d-red flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        <span>Masuk ke Akun {requiredRole}</span>
      </button>
    </div>
  );
}

function MainApp() {
  const { role, isAuthenticated, activeView, setActiveView, setAuthModalOpen, setAuthMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [playingMovie, setPlayingMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleRequireLogin = (targetRole) => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSearchClickFromBottom = () => {
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cinema-950 text-white flex flex-col selection:bg-cinema-red selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Views with Strict Route Guarding */}
      <main className="flex-1">
        {activeView === 'catalog' && (
          <ViewerCatalog
            onPlayMovie={(m) => setPlayingMovie(m)}
            onSelectMovie={(m) => setSelectedMovie(m)}
            searchQuery={searchQuery}
          />
        )}

        {activeView === 'support' && (
          <SupportQRISView />
        )}

        {activeView === 'superadmin' && (
          isAuthenticated && role === 'SUPERADMIN' ? (
            <SuperAdminDashboard />
          ) : (
            <UnauthorizedNotice 
              requiredRole="Super Admin" 
              onLoginClick={() => handleRequireLogin('SUPERADMIN')} 
            />
          )
        )}

        {activeView === 'admin' && (
          isAuthenticated && (role === 'ADMIN' || role === 'SUPERADMIN') ? (
            <AdminDashboard />
          ) : (
            <UnauthorizedNotice 
              requiredRole="Admin Studio" 
              onLoginClick={() => handleRequireLogin('ADMIN')} 
            />
          )
        )}
      </main>

      {/* Video Streaming Cinema Player Modal */}
      {playingMovie && (
        <PlayerModal
          movie={playingMovie}
          onClose={() => setPlayingMovie(null)}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlay={(m) => setPlayingMovie(m)}
        />
      )}

      {/* Auth Login/Register Modal with CAPTCHA */}
      <AuthModal />

      {/* Footer */}
      <Footer setActiveView={setActiveView} />

      {/* Mobile App Bottom Navigation Bar (Shown only on small/medium screens) */}
      <BottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onSearchClick={handleSearchClickFromBottom}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
