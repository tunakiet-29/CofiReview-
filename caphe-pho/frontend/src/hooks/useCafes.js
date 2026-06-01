import { useState, useEffect, useCallback } from 'react';
import { cafeAPI } from '../services/api';

export function useCafes(socket) {
  const [cafes, setCafes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [activeTag, setActiveTag] = useState('all');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeTag !== 'all') params.tag = activeTag;
      const data = await cafeAPI.list(params);
      setCafes(data);
    } catch (err) {
      setError(err.response ? (err.response.data?.error || 'Lỗi server') : 'backend_down');
      setCafes([]);
    } finally { setLoading(false); }
  }, [search, activeTag]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ cafeId, avg_rating, review_count }) => {
      setCafes(prev => prev.map(c =>
        c.id === cafeId ? { ...c, avg_rating, review_count } : c
      ));
    };
    socket.on('cafe_stats_updated', handler);
    return () => socket.off('cafe_stats_updated', handler);
  }, [socket]);

  return { cafes, loading, error, search, setSearch, activeTag, setActiveTag, reload: load };
}
