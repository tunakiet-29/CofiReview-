// components/Toast.jsx — notification popup góc phải
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-green-700 text-white',
    error:   'bg-red-700 text-white',
    info:    'bg-brown-dark text-cream',
  };

  return (
    <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      flex items-center gap-3 max-w-xs transition-opacity duration-300
      ${colors[type]} ${visible ? 'opacity-100 toast-enter' : 'opacity-0'}`}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-auto opacity-70 hover:opacity-100 text-base leading-none">×</button>
    </div>
  );
}
