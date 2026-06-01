// components/ReviewForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';
import StarRating from './StarRating';

const MAX_CHARS = 500;

export default function ReviewForm({ cafeId, onReviewAdded, onNeedAuth }) {
  const { user } = useAuth();
  const [stars, setStars]     = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!user) {
    return (
      <div className="mt-6 pt-5 border-t border-border text-center">
        <p className="text-sm text-muted mb-3">Đăng nhập để viết đánh giá của bạn</p>
        <button onClick={onNeedAuth}
          className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-lg
                     hover:bg-brown-mid transition-colors">
          Đăng nhập / Đăng ký
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    // Validation — US3: bắt buộc chọn sao
    if (!stars) return setError('Vui lòng chọn số sao trước khi gửi');

    setLoading(true);
    try {
      const result = await reviewAPI.create(cafeId, { stars, content });
      onReviewAdded(result.data);
      setStars(0);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi thất bại, thử lại nhé');
    } finally { setLoading(false); }
  };

  const charsLeft = MAX_CHARS - content.length;

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-brown-dark">✍️ Đánh giá của bạn</h3>
        <span className="text-xs text-muted">
          Xin chào, <span className="font-medium text-brown-mid">{user.name}</span>
        </span>
      </div>

      {/* Chọn sao — bắt buộc */}
      <div className={`flex items-center gap-3 mb-3 rounded-lg px-3 py-2 transition-colors
        ${!stars ? 'bg-red-50 border border-red-200' : 'bg-tag-bg'}`}>
        <span className="text-xs text-muted">
          Chọn sao: <span className="text-red-400">*</span>
        </span>
        <StarRating value={stars} onChange={setStars} size="md" />
        {stars > 0
          ? <span className="text-xs text-muted ml-auto">{['','Tệ','Tạm','Ổn','Tốt','Xuất sắc'][stars]}</span>
          : <span className="text-xs text-red-400 ml-auto">Bắt buộc</span>
        }
      </div>

      {/* Textarea + đếm ký tự — US3: giới hạn 500 ký tự */}
      <div className="relative mb-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Chia sẻ trải nghiệm của bạn tại quán... (tuỳ chọn)"
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none
                     focus:border-brown-light resize-none text-brown-dark bg-white"
        />
        <span className={`absolute bottom-2 right-2 text-xs
          ${charsLeft < 50 ? 'text-red-400' : 'text-muted'}`}>
          {charsLeft}/{MAX_CHARS}
        </span>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">⚠️ {error}</p>}

      {/* Nút gửi — US3: disable khi chưa chọn sao */}
      <button
        onClick={handleSubmit}
        disabled={loading || !stars}
        title={!stars ? 'Vui lòng chọn số sao trước' : ''}
        className={`text-white text-sm font-medium px-5 py-2 rounded-lg transition-all
          ${!stars
            ? 'bg-border text-muted cursor-not-allowed'
            : 'bg-accent hover:bg-brown-mid cursor-pointer'}
          ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>

      {!stars && (
        <span className="text-xs text-muted ml-3">← Chọn sao để kích hoạt</span>
      )}
    </div>
  );
}
