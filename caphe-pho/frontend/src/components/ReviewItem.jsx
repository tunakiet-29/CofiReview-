// components/ReviewItem.jsx
import { useState } from 'react';
import StarRating from './StarRating';
import { Check, PencilSimple, Trash, X } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';

const MAX_CHARS = 500;

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  const d = Math.floor(diff / 86400);
  if (d < 7) return `${d} ngày trước`;
  if (d < 30) return `${Math.floor(d / 7)} tuần trước`;
  return `${Math.floor(d / 30)} tháng trước`;
}

export default function ReviewItem({
  review,
  cafeId,
  isNew = false,
  onReviewUpdated,
  onReviewDeleted,
}) {
  const { reviewer, stars, content = '', created_at } = review;
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draftStars, setDraftStars] = useState(stars);
  const [draftContent, setDraftContent] = useState(content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthor = user && Number(user.id) === Number(review.user_id);
  const charsLeft = MAX_CHARS - (draftContent || '').length;

  const cancelEdit = () => {
    setDraftStars(stars);
    setDraftContent(content || '');
    setEditing(false);
    setError('');
  };

  const saveEdit = async () => {
    setError('');
    if (!draftStars) return setError('Vui lòng chọn số sao');
    if (draftContent.trim().length < 5) return setError('Nội dung ít nhất 5 ký tự');

    setLoading(true);
    try {
      const result = await reviewAPI.update(cafeId, review.id, {
        stars: draftStars,
        content: draftContent.trim(),
      });
      onReviewUpdated?.(result.data, result.stats);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await reviewAPI.remove(cafeId, review.id);
      onReviewDeleted?.(result.deletedId, result.stats);
    } catch (err) {
      setError(err.response?.data?.error || 'Xóa đánh giá thất bại');
      setConfirmingDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all group
      ${isNew ? 'border-accent/40 bg-accent/5 slide-up shadow-sm' : 'border-border fade-in hover:border-brown-light hover:shadow-sm'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-tag-bg flex items-center justify-center
                          text-sm font-bold text-brown-mid border border-border">
            {reviewer?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brown-dark">{reviewer}</span>
              {isNew && <span className="text-[10px] uppercase tracking-wide font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Mới</span>}
            </div>
            <span className="text-xs text-muted block mt-0.5">{timeAgo(created_at)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {editing ? (
            <StarRating value={draftStars} onChange={setDraftStars} size="sm" />
          ) : (
            <StarRating value={stars} readOnly size="sm" />
          )}

          {isAuthor && !editing && (
            <div className={`flex items-center gap-2 transition-opacity ${confirmingDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {confirmingDelete ? (
                <>
                  <span className="text-xs text-muted">Xóa?</span>
                  <button
                    onClick={deleteReview}
                    disabled={loading}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                    aria-label="Xác nhận xóa đánh giá"
                    title="Xác nhận xóa"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={loading}
                    className="text-muted hover:text-brown-mid transition-colors p-1 disabled:opacity-50"
                    aria-label="Hủy xóa đánh giá"
                    title="Hủy"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-muted hover:text-brown-mid transition-colors p-1"
                    aria-label="Sửa đánh giá"
                    title="Sửa đánh giá"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="text-muted hover:text-red-500 transition-colors p-1"
                    aria-label="Xóa đánh giá"
                    title="Xóa đánh giá"
                  >
                    <Trash size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="pl-12">
          <div className="relative">
            <textarea
              value={draftContent}
              onChange={e => setDraftContent(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none
                         focus:border-brown-light focus:ring-2 focus:ring-accent/10 resize-none text-brown-dark bg-white transition-all"
            />
            <span className={`absolute bottom-3 right-3 text-xs font-medium ${charsLeft < 50 ? 'text-red-500' : 'text-muted'}`}>
              {draftContent.length}/{MAX_CHARS}
            </span>
          </div>

          {error && <p className="text-red-500 text-xs font-medium mt-2">{error}</p>}

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={saveEdit}
              disabled={loading}
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brown-mid active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-brown-dark hover:bg-tag-bg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-brown-dark leading-relaxed pl-12">"{content}"</p>
          {error && <p className="text-red-500 text-xs font-medium mt-2 pl-12">{error}</p>}
        </>
      )}
    </div>
  );
}
