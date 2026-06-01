import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cafeAPI, reviewAPI } from '../services/api';
import StarRating from '../components/StarRating';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';

export default function CafeDetailPage({ socket, onNeedAuth }) {
  const { id } = useParams();
  const [cafe, setCafe]       = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newIds, setNewIds]   = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [cafeData, reviewsData] = await Promise.all([
        cafeAPI.getById(id),
        reviewAPI.list(id),
      ]);
      setCafe(cafeData);
      setReviews(reviewsData);
    } catch (err) {
      if (!err.response) setError('backend_down');
      else if (err.response.status === 404) setError('not_found');
      else setError(err.response?.data?.error || 'Lỗi server');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_cafe', id);
    const handleNewReview = (review) => {
      setReviews(prev => prev.some(r => r.id === review.id) ? prev : [review, ...prev]);
      setNewIds(prev => new Set([...prev, review.id]));
      setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(review.id); return s; }), 5000);
      setCafe(prev => {
        if (!prev) return prev;
        const cnt = prev.review_count + 1;
        const total = (parseFloat(prev.avg_rating) || 0) * prev.review_count + review.stars;
        return { ...prev, review_count: cnt, avg_rating: (total/cnt).toFixed(1) };
      });
    };
    socket.on('new_review', handleNewReview);
    return () => { socket.emit('leave_cafe', id); socket.off('new_review', handleNewReview); };
  }, [socket, id]);

  const handleReviewAdded = (review) => {
    setReviews(prev => [review, ...prev]);
    setNewIds(prev => new Set([...prev, review.id]));
    setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(review.id); return s; }), 5000);
    setCafe(prev => {
      if (!prev) return prev;
      const cnt = prev.review_count + 1;
      const total = (parseFloat(prev.avg_rating) || 0) * prev.review_count + review.stars;
      return { ...prev, review_count: cnt, avg_rating: (total/cnt).toFixed(1) };
    });
  };

  // Loading skeleton
  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="h-36 bg-card-bg rounded-2xl border border-border animate-pulse" />
      <div className="h-20 bg-card-bg rounded-xl border border-border animate-pulse" />
      <div className="h-20 bg-card-bg rounded-xl border border-border animate-pulse" />
    </div>
  );

  // US2: ID quán không tồn tại
  if (error === 'not_found') return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="font-display text-xl text-brown-dark mb-2">Không tìm thấy quán</h2>
      <p className="text-muted text-sm mb-6">Quán này không tồn tại hoặc đã bị xoá.</p>
      <Link to="/" className="bg-accent text-white px-5 py-2 rounded-lg text-sm hover:bg-brown-mid transition-colors">
        ← Về trang chủ
      </Link>
    </div>
  );

  // Backend chưa chạy
  if (error === 'backend_down') return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">☕</div>
      <h2 className="font-display text-xl text-brown-dark mb-2">Server đang tắt</h2>
      <p className="text-muted text-sm mb-6">Vui lòng khởi động backend trước khi dùng web.</p>
      <div className="bg-tag-bg rounded-xl p-4 text-left text-sm font-mono text-brown-mid mb-6 max-w-xs mx-auto">
        <p className="text-xs text-muted mb-1">Chạy lệnh này trong terminal:</p>
        cd caphe-pho\backend<br/>npm run dev
      </div>
      <button onClick={load} className="bg-accent text-white px-5 py-2 rounded-lg text-sm hover:bg-brown-mid transition-colors mr-3">
        Thử lại
      </button>
      <Link to="/" className="text-sm text-accent hover:underline">← Quay lại</Link>
    </div>
  );

  // Lỗi khác
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-sm">⚠️ {error}</div>
      <div className="flex gap-3 mt-4">
        <button onClick={load} className="text-sm text-accent hover:underline">Thử lại</button>
        <Link to="/" className="text-sm text-accent hover:underline">← Quay lại</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* US5: Nút quay lại rõ ràng */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brown-mid transition-colors mb-4">
        ← Quay lại danh sách
      </Link>

      {/* Cafe header */}
      <div className="bg-brown-dark rounded-2xl p-5 text-cream mb-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{cafe.emoji}</span>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">{cafe.name}</h1>
            <p className="text-cream/70 text-sm mt-0.5">📍 {cafe.address}</p>
            <p className="text-cream/75 text-sm mt-2 leading-relaxed">{cafe.description}</p>
          </div>
        </div>
        {/* US4: Rating đồng bộ realtime */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{cafe.avg_rating || '—'}</span>
            {cafe.avg_rating && <StarRating value={Math.round(cafe.avg_rating)} readOnly size="lg" />}
          </div>
          <span className="text-cream/60 text-sm">{cafe.review_count} đánh giá</span>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {(cafe.tags || []).map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/15 text-cream">{tag}</span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-card-bg border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-normal text-brown-dark">
            Đánh giá <span className="font-body text-sm font-normal text-muted">({reviews.length})</span>
          </h2>
          {socket?.connected && (
            <span className="live-dot text-xs text-green-600 flex items-center">Realtime</span>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-muted text-sm py-6">🍃 Chưa có đánh giá. Hãy là người đầu tiên!</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto review-scroll pr-1">
            {reviews.map(r => (
              <ReviewItem key={r.id} review={r} isNew={newIds.has(r.id)} />
            ))}
          </div>
        )}

        <ReviewForm cafeId={id} onReviewAdded={handleReviewAdded} onNeedAuth={onNeedAuth} />
      </div>
    </div>
  );
}
