import { useCafes } from '../hooks/useCafes';
import { useFavorites } from '../hooks/useFavorites';
import CafeCard from '../components/CafeCard';
import { WarningCircle, MagnifyingGlass, Storefront, Coffee, Brandy, Leaf } from '@phosphor-icons/react';

const TAGS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cà phê', label: 'Cà phê', icon: Coffee },
  { key: 'trà sữa', label: 'Trà sữa', icon: Brandy },
  { key: 'matcha', label: 'Matcha', icon: Leaf },
];

export default function HomePage({ socket, connected, onNeedAuth }) {
  const { cafes, loading, error, search, setSearch, activeTag, setActiveTag, reload } = useCafes(socket);
  const { isFavorited, toggleFavorite } = useFavorites(onNeedAuth);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero + Search ────────────────────────────────────────── */}
      <section className="bg-brown-dark relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #d96b27 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #8c5e3c 0%, transparent 50%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 py-14 relative z-10">
          {/* Tagline */}
          <p className="text-brown-light text-sm font-semibold uppercase tracking-widest mb-3">Khám phá · Đánh giá · Chia sẻ</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-8 max-w-xl leading-tight">
            Tìm quán cà phê <br className="hidden sm:block" />
            <span className="text-accent">ưng ý</span> của bạn
          </h1>

          {/* Search box */}
          <div className="max-w-2xl">
            <div className="relative mb-4">
              <MagnifyingGlass
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                size={20} weight="bold"
              />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tên quán, địa chỉ, khu vực..."
                className="w-full rounded-2xl pl-12 pr-5 py-4 text-base bg-white text-brown-dark
                           placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-accent/50 shadow-lg"
              />
            </div>

            {/* Tag filters */}
            <div className="flex gap-2 flex-wrap">
              {TAGS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => setActiveTag(t.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all active:scale-[0.97]
                      ${activeTag === t.key
                        ? 'bg-accent border-accent text-white shadow-md shadow-accent/25'
                        : 'border-white/20 text-cream/80 hover:border-white/50 hover:text-white hover:bg-white/10'}`}>
                    {Icon && <Icon weight={activeTag === t.key ? 'fill' : 'regular'} size={16} />}
                    {t.label}
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* ── Cafe Grid ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="flex justify-between items-end mb-8 pb-4 border-b border-border">
          <div>
            <h2 className="font-display text-2xl font-bold text-brown-dark tracking-tight">
              {search ? `Kết quả cho "${search}"` : activeTag !== 'all' ? `Lọc: ${activeTag}` : 'Tất cả quán'}
            </h2>
            {!loading && !error && (
              <p className="text-muted text-sm mt-0.5">{cafes.length} quán được tìm thấy</p>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-card-bg rounded-2xl border border-border overflow-hidden h-[340px] animate-pulse flex flex-col">
                <div className="h-48 bg-tag-bg w-full" />
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="h-6 bg-tag-bg rounded-md w-3/4" />
                  <div className="h-4 bg-tag-bg rounded-md w-full" />
                  <div className="h-4 bg-tag-bg rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Backend down */}
        {error && !loading && (
          <div className="text-center py-20 bg-card-bg rounded-2xl border border-border">
            <WarningCircle className="mx-auto text-brown-light mb-4" size={56} weight="duotone" />
            <h2 className="font-display text-2xl font-bold text-brown-dark mb-3">Server đang tắt</h2>
            <p className="text-muted text-base mb-6 max-w-md mx-auto leading-relaxed">
              Không thể kết nối đến máy chủ. Vui lòng khởi động backend để sử dụng CofiReview.
            </p>
            <button onClick={reload}
              className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-brown-mid active:scale-[0.98] transition-all">
              Thử lại kết nối
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cafes.length === 0 && (
          <div className="text-center py-24 bg-card-bg rounded-2xl border border-border text-muted">
            {search || activeTag !== 'all' ? (
              <MagnifyingGlass className="mx-auto mb-4 text-brown-light opacity-50" size={64} weight="light" />
            ) : (
              <Storefront className="mx-auto mb-4 text-brown-light opacity-50" size={64} weight="light" />
            )}
            <h3 className="text-xl font-bold text-brown-dark mb-2">
              {search || activeTag !== 'all' ? 'Không tìm thấy quán nào' : 'Hiện chưa có dữ liệu'}
            </h3>
            <p className="text-sm">
              {search || activeTag !== 'all'
                ? 'Thử từ khoá khác hoặc bỏ bộ lọc'
                : 'Vui lòng chạy lệnh seed để thêm dữ liệu mẫu'}
            </p>
          </div>
        )}

        {/* Cafe grid */}
        {!loading && !error && cafes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {cafes.map(cafe => (
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
    </div>
  );
}

