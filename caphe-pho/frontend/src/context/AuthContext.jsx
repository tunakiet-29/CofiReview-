// context/AuthContext.jsx
// Global auth state — dùng React Context + localStorage
import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const login = useCallback(async (email, password) => {
    setLoading(true); setError('');
    try {
      const { token, user: u } = await authAPI.login({ email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
      return false;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true); setError('');
    try {
      const { token, user: u } = await authAPI.register({ name, email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
      return false;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const clearError = () => setError('');

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
