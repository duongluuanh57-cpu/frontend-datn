import { create } from 'zustand';

interface FavoriteState {
  favoriteCount: number;
  favoriteIds: Set<string>;
  setFavoriteCount: (count: number) => void;
  setFavoriteIds: (ids: string[]) => void;
  addFavoriteId: (id: string) => void;
  removeFavoriteId: (id: string) => void;
  incrementFavorite: () => void;
  decrementFavorite: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favoriteCount: 0,
  favoriteIds: new Set<string>(),
  setFavoriteCount: (count) => set({ favoriteCount: count }),
  setFavoriteIds: (ids) => set({ favoriteIds: new Set(ids), favoriteCount: ids.length }),
  addFavoriteId: (id) => set((state) => {
    const next = new Set(state.favoriteIds);
    next.add(id);
    return { favoriteIds: next, favoriteCount: next.size };
  }),
  removeFavoriteId: (id) => set((state) => {
    const next = new Set(state.favoriteIds);
    next.delete(id);
    return { favoriteIds: next, favoriteCount: next.size };
  }),
  incrementFavorite: () => set((state) => ({ favoriteCount: state.favoriteCount + 1 })),
  decrementFavorite: () => set((state) => ({ favoriteCount: Math.max(0, state.favoriteCount - 1) })),
}));
