import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cafeAPI, reviewAPI } from '../services/api';
import StarRating from '../components/StarRating';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';
import { ArrowLeft, MapPin, WarningCircle, MagnifyingGlass, Heart, ChatCircleText } from '@phosphor-icons/react';

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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      <div className="h-64 bg-card-bg rounded-2xl border border-border animate-pulse" />
      <div className="h-20 bg-card-bg rounded-xl border border-border animate-pulse" />
      <div className="h-20 bg-card-bg rounded-xl border border-border animate-pulse" />
    </div>
  );

  // US2: ID quán không tồn tại
  if (error === 'not_found') return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <MagnifyingGlass className="mx-auto mb-4 text-brown-light opacity-50" size={64} weight="light" />
      <h2 className="font-display text-2xl font-bold text-brown-dark mb-2">Không tìm thấy quán</h2>
      <p className="text-muted text-sm mb-8">Quán này không tồn tại hoặc đã bị xoá khỏi hệ thống.</p>
      <Link to="/" className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-brown-mid active:scale-[0.98] transition-all">
        Trở về trang chủ
      </Link>
    </div>
  );

  // Backend chưa chạy
  if (error === 'backend_down') return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center bg-card-bg rounded-2xl border border-border mt-8">
      <WarningCircle className="mx-auto text-brown-light mb-4" size={56} weight="duotone" />
      <h2 className="font-display text-2xl font-bold text-brown-dark mb-3">Server đang tắt</h2>
      <p className="text-muted text-base mb-6 max-w-md mx-auto leading-relaxed">
        Không thể kết nối đến máy chủ. Vui lòng khởi động backend để xem chi tiết quán.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={load} className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-brown-mid active:scale-[0.98] transition-all">
          Thử lại
        </button>
        <Link to="/" className="px-6 py-2.5 rounded-lg font-medium text-sm text-brown-dark border border-border hover:bg-tag-bg transition-colors">
          Quay lại
        </Link>
      </div>
    </div>
  );

  // Lỗi khác
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-sm flex items-center gap-3">
        <WarningCircle size={20} />
        {error}
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={load} className="text-sm font-medium text-accent hover:underline">Thử lại</button>
        <Link to="/" className="text-sm font-medium text-brown-light hover:underline">Trở về trang chủ</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* US5: Nút quay lại rõ ràng */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brown-mid transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách
      </Link>

      {/* Cafe header */}
      <div className="bg-card-bg border border-border rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="w-full h-64 sm:h-80 relative bg-tag-bg">
          <img 
            src={`https://picsum.photos/seed/cafe-${cafe.id}/1200/600`} 
            alt={cafe.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-cream drop-shadow-md">{cafe.name}</h1>
              <p className="text-cream/90 text-sm flex items-center gap-1.5 font-medium drop-shadow">
                <MapPin weight="fill" /> {cafe.address}
              </p>
            </div>
            {/* US6: Bookmark */}
            <button 
              onClick={() => { /* Mock Toggle Favorite */ }}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent hover:border-accent border border-white/30 transition-all active:scale-[0.98]"
              aria-label="Lưu quán"
            >
              <Heart weight="bold" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-brown-dark text-base leading-relaxed max-w-2xl">{cafe.description}</p>
          
          <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2 bg-brown-dark text-cream px-3 py-1.5 rounded-xl">
                <span className="text-2xl font-bold leading-none">{cafe.avg_rating || '-'}</span>
                {cafe.avg_rating && <StarRating value={Math.round(cafe.avg_rating)} readOnly size="sm" />}
              </div>
              <span className="text-muted text-sm font-medium">{cafe.review_count} đánh giá</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(cafe.tags || []).map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-tag-bg text-brown-mid font-medium uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-card-bg border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 className="font-display text-xl font-bold text-brown-dark">
            Đánh giá <span className="font-body text-base font-normal text-muted ml-1">({reviews.length})</span>
          </h2>

        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <ChatCircleText className="mx-auto mb-3 text-brown-light opacity-50" size={48} weight="light" />
            <p className="text-muted text-sm font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto review-scroll pr-2">
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
