// components/CafeCard.jsx
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { MapPin, Heart } from '@phosphor-icons/react';

export default function CafeCard({ cafe, isFavorited = false, onToggleFavorite }) {
  const { id, name, address, tags, avg_rating, review_count } = cafe;

  return (
    <Link to={`/cafes/${id}`}
      className="block bg-card-bg border border-border rounded-2xl overflow-hidden fade-in
                 hover:border-brown-light hover:shadow-md transition-all duration-300
                 hover:-translate-y-1 active:scale-[0.98] group relative flex flex-col">
                 
      {/* Top Image */}
      <div className="w-full h-48 bg-tag-bg relative overflow-hidden">
        <img 
          src={(
            (cafe.image || cafe.image_url)
              ? ((cafe.image || cafe.image_url).startsWith('/') ? (cafe.image || cafe.image_url) : `/api/images?url=${encodeURIComponent(cafe.image || cafe.image_url)}`)
              : `https://picsum.photos/seed/coffee${id}/600/400`
          )}
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={e => { e.target.src = `https://picsum.photos/seed/coffee${id}/600/400`; }}
        />
        {/* Favorite Button */}
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(); }}
          className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10
            ${isFavorited ? 'text-accent shadow-md shadow-accent/20' : 'text-brown-mid hover:text-accent hover:bg-white'}`}
          aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart weight={isFavorited ? 'fill' : 'regular'} size={18} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h2 className="font-display font-bold text-lg leading-tight text-brown-dark group-hover:text-brown-mid transition-colors line-clamp-2">
            {name}
          </h2>
          {avg_rating ? (
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-1 bg-brown-dark text-cream px-2 py-0.5 rounded-lg">
                <span className="font-bold text-sm leading-none">{avg_rating}</span>
                <StarRating value={Math.round(avg_rating)} readOnly size="xs" />
              </div>
              <span className="text-[10px] text-muted mt-1 uppercase tracking-wide">
                {review_count} review
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted text-right bg-tag-bg px-2 py-1 rounded-lg flex-shrink-0">
              Mới
            </span>
          )}
        </div>
        
        <p className="text-muted text-sm mt-0.5 flex items-center gap-1.5 truncate">
          <MapPin weight="fill" className="text-brown-light flex-shrink-0" />
          <span className="truncate">{address}</span>
        </p>

        <div className="flex gap-2 mt-auto pt-4 flex-wrap">
          {(tags || []).map(tag => (
            <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-tag-bg text-brown-mid font-medium uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
