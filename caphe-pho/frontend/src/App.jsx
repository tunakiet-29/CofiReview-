// App.jsx — Root: routing, socket, auth, toast
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import CafeDetailPage from './pages/CafeDetailPage';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { Coffee, SignIn, SignOut, Heart } from '@phosphor-icons/react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function Header({ onOpenAuth, connected }) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-brown-dark sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <Coffee weight="fill" size={26} className="text-accent group-hover:text-brown-light transition-colors" />
          <span className="font-display text-xl font-bold text-cream tracking-tight">
            CofiReview
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/favorites"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-cream/80 hover:border-white/50 hover:text-white transition-all">
                <Heart size={16} />
                Yêu thích
              </Link>
              <span className="text-cream/70 text-sm hidden sm:block">
                Xin chào, <span className="text-cream font-semibold">{user.name}</span>
              </span>
              <button onClick={logout}
                className="flex items-center gap-1.5 text-sm border border-white/20 text-cream/80 px-4 py-2 rounded-full
                           hover:border-white/50 hover:text-white transition-all active:scale-[0.97]">
                <SignOut size={16} />
                <span className="hidden sm:block">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth}
              className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full
                         hover:bg-brown-light transition-all active:scale-[0.97]">
              <SignIn size={16} />
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const socketRef   = useRef(null);
  const [connected, setConnected] = useState(false);
  const [showAuth, setShowAuth]   = useState(false);
  const [toasts, setToasts]       = useState([]);
  const { user } = useAuth();

  // Khởi tạo Socket.IO một lần
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    // Toast khi có review mới (từ người khác)
    socket.on('new_review', (review) => {
      if (user && review.user_id !== user.id) {
        addToast(`${review.reviewer} vừa review quán này!`, 'info');
      }
    });
    return () => socket.disconnect();
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const socket = socketRef.current;

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenAuth={() => setShowAuth(true)} connected={connected} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage socket={socket} connected={connected} onNeedAuth={() => setShowAuth(true)} />} />
          <Route path="/favorites" element={<FavoritesPage onNeedAuth={() => setShowAuth(true)} />} />
          <Route path="/cafes/:id" element={
            <CafeDetailPage socket={socket} onNeedAuth={() => setShowAuth(true)} />
          } />
          <Route path="*" element={
            <div className="text-center py-24 text-muted">
              <Coffee size={64} weight="light" className="mx-auto mb-4 opacity-40" />
              <p className="text-xl font-semibold text-brown-dark mb-2">Trang không tồn tại</p>
              <Link to="/" className="text-accent text-sm font-medium hover:underline mt-2 block">Về trang chủ</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Coffee weight="fill" size={18} className="text-accent" />
            <span className="font-display font-bold text-sm text-brown-dark">CofiReview</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Toasts */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type}
            onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
