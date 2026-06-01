// components/SearchBar.jsx
const TAGS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cà phê', label: '☕ Cà phê' },
  { key: 'trà sữa', label: '🧋 Trà sữa' },
  { key: 'matcha', label: '🍵 Matcha' },
];

export default function SearchBar({ search, onSearchChange, activeTag, onTagChange, connected }) {
  return (
    <div className="bg-brown-mid px-6 py-4 flex flex-col sm:flex-row gap-3 items-center">
      <div className="flex-1 relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input
          type="text" value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder="Tìm quán theo tên hoặc địa chỉ..."
          className="w-full rounded-full pl-9 pr-4 py-2 text-sm bg-white/95 text-brown-dark
                     placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
        {TAGS.map(t => (
          <button key={t.key} onClick={() => onTagChange(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all
              ${activeTag === t.key
                ? 'bg-accent border-accent text-white'
                : 'border-white/40 text-white/80 hover:border-white hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Realtime indicator */}
      {connected && (
        <span className="live-dot text-xs text-green-300 whitespace-nowrap hidden sm:flex items-center">
          Live
        </span>
      )}
    </div>
  );
}
