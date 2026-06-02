// components/ReviewForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';
import StarRating from './StarRating';
import { PencilSimpleLine, WarningCircle } from '@phosphor-icons/react';

const MAX_CHARS = 500;

export default function ReviewForm({ cafeId, onReviewAdded, onNeedAuth }) {
  const { user } = useAuth();
  const [stars, setStars]     = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!user) {
    return (
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted mb-4">Đăng nhập để viết đánh giá của bạn</p>
        <button onClick={onNeedAuth}
          className="bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-lg
                     hover:bg-brown-mid active:scale-[0.98] transition-all">
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
      onReviewAdded(result.data, result.stats);
      setStars(0);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi thất bại, thử lại nhé');
    } finally { setLoading(false); }
  };

  const charsLeft = MAX_CHARS - content.length;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-brown-dark flex items-center gap-2">
          <PencilSimpleLine size={20} className="text-brown-light" />
          Đánh giá của bạn
        </h3>
        <span className="text-xs text-muted">
          Xin chào, <span className="font-bold text-brown-mid">{user.name}</span>
        </span>
      </div>

      {/* Chọn sao — bắt buộc */}
      <div className={`flex items-center gap-4 mb-4 rounded-xl px-4 py-3 transition-colors border
        ${!stars ? 'bg-red-50/50 border-red-200' : 'bg-tag-bg border-transparent'}`}>
        <span className="text-sm font-medium text-brown-dark flex items-center gap-1">
          Đánh giá chung <span className="text-red-500">*</span>
        </span>
        <StarRating value={stars} onChange={setStars} size="md" />
        {stars > 0
          ? <span className="text-xs font-bold text-brown-mid ml-auto uppercase tracking-wide">{['','Tệ','Tạm','Ổn','Tốt','Xuất sắc'][stars]}</span>
          : <span className="text-xs text-red-500 font-medium ml-auto">Bắt buộc</span>
        }
      </div>

      {/* Textarea + đếm ký tự — US3: giới hạn 500 ký tự */}
      <div className="relative mb-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Chia sẻ trải nghiệm của bạn tại quán... (tuỳ chọn)"
          rows={4}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none
                     focus:border-brown-light focus:ring-2 focus:ring-accent/10 resize-none text-brown-dark bg-white transition-all"
        />
        <span className={`absolute bottom-3 right-3 text-xs font-medium
          ${charsLeft < 50 ? 'text-red-500' : 'text-muted'}`}>
          {content.length}/{MAX_CHARS}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
          <WarningCircle size={18} />
          {error}
        </div>
      )}

      {/* Nút gửi — US3: disable khi chưa chọn sao */}
      <div className="flex items-center">
        <button
          onClick={handleSubmit}
          disabled={loading || !stars}
          title={!stars ? 'Vui lòng chọn số sao trước' : ''}
          className={`text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all active:scale-[0.98]
            ${!stars
              ? 'bg-border text-muted cursor-not-allowed opacity-70'
              : 'bg-accent hover:bg-brown-mid cursor-pointer'}
            ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>

        {!stars && (
          <span className="text-xs font-medium text-muted ml-3 flex items-center gap-1 opacity-70">
            ← Chọn sao để có thể gửi
          </span>
        )}
      </div>
    </div>
  );
}
