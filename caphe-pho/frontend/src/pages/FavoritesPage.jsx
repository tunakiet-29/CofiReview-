import { Link } from 'react-router-dom';
import { Heart, WarningCircle, MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import CafeCard from '../components/CafeCard';

export default function FavoritesPage({ onNeedAuth }) {
  const { user } = useAuth();
  const { favorites, loading, error, isFavorited, toggleFavorite } = useFavorites(onNeedAuth);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Heart size={56} className="mx-auto mb-6 text-accent opacity-80" weight="fill" />
        <h2 className="font-display text-2xl font-bold text-brown-dark mb-3">Đăng nhập để xem yêu thích</h2>
        <p className="text-muted mb-6">Tạo danh sách quán yêu thích và truy cập nhanh những quán bạn đã lưu.</p>
        <button onClick={onNeedAuth}
          className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brown-mid transition-all">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-brown-dark">Quán yêu thích</h1>
          <p className="text-muted text-sm mt-1">Danh sách quán bạn đã lưu để xem lại sau.</p>
        </div>
        <Link to="/" className="text-sm font-medium text-accent hover:underline">Quay lại trang chủ</Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[320px] bg-card-bg rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-card-bg border border-border rounded-2xl p-8 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-24 bg-card-bg border border-border rounded-2xl">
          <MagnifyingGlass className="mx-auto mb-4 text-brown-light opacity-50" size={64} weight="light" />
          <h2 className="font-display text-xl font-bold text-brown-dark mb-2">Bạn chưa có quán yêu thích nào</h2>
          <p className="text-muted text-sm mb-6">Hãy khám phá quán và bấm trái tim để lưu lại.</p>
          <Link to="/" className="bg-accent text-white px-5 py-2.5 rounded-full font-medium hover:bg-brown-mid transition-all">
            Khám phá quán ngay
          </Link>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(cafe => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              isFavorited={isFavorited(cafe.id)}
              onToggleFavorite={() => toggleFavorite(cafe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
