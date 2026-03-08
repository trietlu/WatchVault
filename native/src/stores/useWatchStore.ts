import { create } from 'zustand';
import type { Watch } from '../types/models';

interface WatchState {
  watches: Watch[];
  selectedWatch: Watch | null;
  loading: boolean;
  setWatches: (watches: Watch[]) => void;
  setSelectedWatch: (watch: Watch | null) => void;
  setLoading: (loading: boolean) => void;
  addWatch: (watch: Watch) => void;
  updateWatch: (id: number, watch: Partial<Watch>) => void;
}

export const useWatchStore = create<WatchState>((set) => ({
  watches: [],
  selectedWatch: null,
  loading: false,
  setWatches: (watches) => set({ watches }),
  setSelectedWatch: (watch) => set({ selectedWatch: watch }),
  setLoading: (loading) => set({ loading }),
  addWatch: (watch) =>
    set((state) => ({
      watches: [watch, ...state.watches],
    })),
  updateWatch: (id, watch) =>
    set((state) => ({
      watches: state.watches.map((item) =>
        item.id === id ? { ...item, ...watch } : item
      ),
      selectedWatch:
        state.selectedWatch?.id === id
          ? { ...state.selectedWatch, ...watch }
          : state.selectedWatch,
    })),
}));
