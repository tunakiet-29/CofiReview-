// components/CafeCard.jsx
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function CafeCard({ cafe }) {
  const { id, name, address, tags, emoji, avg_rating, review_count } = cafe;

  return (
    <Link to={`/cafes/${id}`}
      className="block bg-card-bg border border-border rounded-2xl p-4 fade-in
                 hover:border-brown-light hover:shadow-md transition-all duration-200
                 hover:-translate-y-0.5 group">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-tag-bg flex items-center justify-center
                        text-3xl flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-base truncate
                         group-hover:text-brown-mid transition-colors">{name}</h2>
          <p className="text-muted text-xs mt-0.5 truncate">📍 {address}</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {(tags || []).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-tag-bg text-brown-mid font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
          {avg_rating ? (
            <>
              <span className="text-xl font-bold text-brown-dark leading-none">{avg_rating}</span>
              <StarRating value={Math.round(avg_rating)} readOnly size="sm" />
              <span className="text-xs text-muted mt-1">{review_count} review</span>
            </>
          ) : (
            <span className="text-xs text-muted text-right leading-snug">Chưa có<br/>review</span>
          )}
        </div>
      </div>
    </Link>
  );
}
