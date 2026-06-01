import { useCafes } from '../hooks/useCafes';
import CafeCard from '../components/CafeCard';
import SearchBar from '../components/SearchBar';

export default function HomePage({ socket, connected }) {
  const { cafes, loading, error, search, setSearch, activeTag, setActiveTag, reload } = useCafes(socket);

  return (
    <>
      <SearchBar
        search={search} onSearchChange={setSearch}
        activeTag={activeTag} onTagChange={setActiveTag}
        connected={connected}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="font-display text-xl font-normal text-brown-dark">
            {search ? 'Kết quả tìm kiếm' : 'Tất cả quán'}
          </h2>
          {!loading && !error && <span className="text-sm text-muted">{cafes.length} quán</span>}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-card-bg rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        )}

        {/* Backend down */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="font-display text-xl text-brown-dark mb-2">Server đang tắt</h2>
            <p className="text-muted text-sm mb-6">Vui lòng khởi động backend trước khi dùng web.</p>
            <div className="bg-tag-bg rounded-xl p-4 text-left text-sm font-mono text-brown-mid mb-6 max-w-xs mx-auto">
              <p className="text-xs text-muted mb-1">Chạy lệnh này trong terminal:</p>
              cd caphe-pho\backend<br/>npm run dev
            </div>
            <button onClick={reload}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm hover:bg-brown-mid transition-colors">
              Thử lại
            </button>
          </div>
        )}

        {/* US1: Không có quán nào */}
        {!loading && !error && cafes.length === 0 && (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-3">
              {search || activeTag !== 'all' ? '🔍' : '🏪'}
            </div>
            <p className="text-base">
              {search || activeTag !== 'all'
                ? 'Không tìm thấy quán nào'
                : 'Hiện chưa có dữ liệu quán'}
            </p>
            <p className="text-sm mt-1">
              {search || activeTag !== 'all'
                ? 'Thử từ khoá khác hoặc bỏ bộ lọc'
                : 'Vui lòng chạy lệnh seed để thêm dữ liệu mẫu'}
            </p>
          </div>
        )}

        {/* Danh sách quán */}
        {!loading && !error && cafes.length > 0 && (
          <div className="space-y-3">
            {cafes.map(cafe => <CafeCard key={cafe.id} cafe={cafe} />)}
          </div>
        )}
      </div>
    </>
  );
}
