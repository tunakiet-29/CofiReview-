// components/ReviewItem.jsx
import StarRating from './StarRating';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext'; // To check if current user is the reviewer

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
  const { user } = useAuth(); // Assuming useAuth exists and provides the logged in user
  
  // US5: Check if the current user is the author of this review
  const isAuthor = user && user.name === reviewer; 

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
          <StarRating value={stars} readOnly size="sm" />
          
          {/* US5: Edit/Delete buttons visible only on hover if author */}
          {isAuthor && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { /* Mock Edit */ }}
                className="text-muted hover:text-brown-mid transition-colors p-1"
                aria-label="Sửa đánh giá"
                title="Sửa đánh giá"
              >
                <PencilSimple size={16} />
              </button>
              <button 
                onClick={() => { /* Mock Delete */ }}
                className="text-muted hover:text-red-500 transition-colors p-1"
                aria-label="Xoá đánh giá"
                title="Xoá đánh giá"
              >
                <Trash size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-brown-dark leading-relaxed pl-12">"{content}"</p>
    </div>
  );
}
