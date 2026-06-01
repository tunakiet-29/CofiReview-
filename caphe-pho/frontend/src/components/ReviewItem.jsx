// components/ReviewItem.jsx
import StarRating from './StarRating';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'Vừa xong';
  if (diff < 3600)  return `${Math.floor(diff/60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
  const d = Math.floor(diff/86400);
  if (d < 7)  return `${d} ngày trước`;
  if (d < 30) return `${Math.floor(d/7)} tuần trước`;
  return `${Math.floor(d/30)} tháng trước`;
}

export default function ReviewItem({ review, isNew = false }) {
  const { reviewer, stars, content, created_at } = review;
  return (
    <div className={`bg-white border rounded-xl p-4 transition-all
      ${isNew ? 'border-accent/40 bg-accent/5 slide-up' : 'border-border fade-in'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-tag-bg flex items-center justify-center
                          text-xs font-bold text-brown-mid">
            {reviewer?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-brown-dark">{reviewer}</span>
          {isNew && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Mới</span>}
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={stars} readOnly size="sm" />
          <span className="text-xs text-muted">{timeAgo(created_at)}</span>
        </div>
      </div>
      <p className="text-sm text-brown-dark/80 leading-relaxed italic">"{content}"</p>
    </div>
  );
}
