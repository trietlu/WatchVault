import { create } from 'zustand';

interface FileRecord {
    id: number;
    url: string;
    type: string;
}

interface WatchEvent {
    id: number;
    eventType: string;
    payloadJson: string;
    payloadHash: string;
    txHash?: string;
    timestamp: string;
}

interface Watch {
    id: number;
    brand: string;
    model: string;
    serialNumberHash: string;
    publicId: string;
    qrCodeUrl: string;
    events: WatchEvent[];
    files: FileRecord[];
}

interface WatchState {
    watches: Watch[];
    selectedWatch: Watch | null;
    loading: boolean;
    setWatches: (watches: Watch[]) => void;
    addWatch: (watch: Watch) => void;
    updateWatch: (id: number, watch: Partial<Watch>) => void;
    deleteWatch: (id: number) => void;
    setSelectedWatch: (watch: Watch | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useWatchStore = create<WatchState>((set) => ({
    watches: [],
    selectedWatch: null,
    loading: false,

    setWatches: (watches) => set({ watches }),

    addWatch: (watch) =>
        set((state) => ({
            watches: [...state.watches, watch],
        })),

    updateWatch: (id, updatedWatch) =>
        set((state) => ({
            watches: state.watches.map((w) =>
                w.id === id ? { ...w, ...updatedWatch } : w
            ),
            selectedWatch:
                state.selectedWatch?.id === id
                    ? { ...state.selectedWatch, ...updatedWatch }
                    : state.selectedWatch,
        })),

    deleteWatch: (id) =>
        set((state) => ({
            watches: state.watches.filter((w) => w.id !== id),
            selectedWatch: state.selectedWatch?.id === id ? null : state.selectedWatch,
        })),

    setSelectedWatch: (watch) => set({ selectedWatch: watch }),

    setLoading: (loading) => set({ loading }),
}));
