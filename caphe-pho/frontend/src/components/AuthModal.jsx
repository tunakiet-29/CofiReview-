// components/AuthModal.jsx — Modal đăng nhập / đăng ký
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuth();

  useEffect(() => { clearError(); }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let ok;
    if (mode === 'login')    ok = await login(email, password);
    else                     ok = await register(name, email, password);
    if (ok) onClose();
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-brown-dark">
            {mode === 'login' ? '☕ Đăng nhập' : '✨ Đăng ký'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-brown-dark text-xl leading-none">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Tên của bạn" required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                         outline-none focus:border-brown-light bg-white text-brown-dark"
            />
          )}
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                       outline-none focus:border-brown-light bg-white text-brown-dark"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu" required
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                       outline-none focus:border-brown-light bg-white text-brown-dark"
          />

          {error && <p className="text-red-500 text-xs">⚠️ {error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white rounded-lg py-2.5 text-sm font-medium
                       hover:bg-brown-mid transition-colors disabled:opacity-50 mt-1">
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-xs text-muted mt-4">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          {' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-accent hover:underline font-medium">
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>


      </div>
    </div>
  );
}
