import { create } from 'zustand';

interface FileRecord {
    id: number;
    url: string;
    type: string;
    storageProvider?: string;
    storageKey?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    checksumSha256?: string | null;
    visibility?: string;
}

interface WatchEvent {
    id: number;
    eventUid?: string;
    eventType: string;
    payloadJson: string;
    payloadHash: string;
    documentHash?: string | null;
    uriHash?: string | null;
    schemaVersion?: number;
    anchorStatus?: string;
    anchorError?: string | null;
    chainId?: number | null;
    contractAddress?: string | null;
    blockNumber?: number | null;
    logIndex?: number | null;
    anchoredAt?: string | null;
    txHash?: string;
    timestamp: string;
    files?: FileRecord[];
}

interface Watch {
    id: number;
    brand: string;
    model: string;
    serialNumberHash: string;
    publicId: string;
    qrCodeUrl?: string | null;
    createdAt?: string;
    events?: WatchEvent[];
    files?: FileRecord[];
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
