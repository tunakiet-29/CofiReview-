import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoriteAPI } from '../services/api';

export function useFavorites(onNeedAuth) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await favoriteAPI.list();
      setFavorites(data);
      setFavoriteIds(new Set(data.map(c => Number(c.id))));
    } catch (err) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setError(err.response?.data?.error || 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorited = useCallback((cafeId) => favoriteIds.has(Number(cafeId)), [favoriteIds]);

  const toggleFavorite = useCallback(async (cafeId) => {
    if (!user) {
      onNeedAuth?.();
      return false;
    }

    const id = Number(cafeId);
    const favorited = favoriteIds.has(id);

    try {
      if (favorited) {
        await favoriteAPI.remove(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setFavorites((prev) => prev.filter(c => Number(c.id) !== id));
      } else {
        await favoriteAPI.add(id);
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        onNeedAuth?.();
      }
      return false;
    }
  }, [favoriteIds, user, onNeedAuth]);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    loadFavorites,
    toggleFavorite,
    isFavorited,
    isLoggedIn: !!user,
  };
}
