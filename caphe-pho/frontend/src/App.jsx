// App.jsx — Root: routing, socket, auth, toast
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import CafeDetailPage from './pages/CafeDetailPage';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function Header({ onOpenAuth, connected }) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-brown-dark sticky top-0 z-40 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="font-display text-lg text-cream hover:opacity-90 transition-opacity whitespace-nowrap">
          ☕ Cà Phê <span className="text-brown-light">Phố</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Socket status */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${connected ? 'bg-green-400' : 'bg-gray-500'}`}
            title={connected ? 'Realtime đang hoạt động' : 'Mất kết nối realtime'} />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-cream/80 text-sm hidden sm:block truncate max-w-[120px]">{user.name}</span>
              <button onClick={logout}
                className="text-xs border border-white/30 text-cream/80 px-3 py-1.5 rounded-full
                           hover:border-white hover:text-white transition-all">
                Đăng xuất
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth}
              className="text-xs bg-accent text-white px-4 py-1.5 rounded-full
                         hover:bg-brown-light transition-colors font-medium">
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
          <Route path="/" element={<HomePage socket={socket} connected={connected} />} />
          <Route path="/cafes/:id" element={
            <CafeDetailPage socket={socket} onNeedAuth={() => setShowAuth(true)} />
          } />
          <Route path="*" element={
            <div className="text-center py-20 text-muted">
              <div className="text-5xl mb-3">☕</div>
              <p>Trang không tồn tại</p>
              <Link to="/" className="text-accent text-sm hover:underline mt-2 block">Về trang chủ</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="py-5 border-t border-border text-center text-xs text-muted">
        Cà Phê Phố v2 — React + Express + SQLite + Socket.IO
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
