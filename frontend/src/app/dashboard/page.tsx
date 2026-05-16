'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getApiAssetUrl } from '@/lib/config';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowRight, ChevronsUpDown, Watch } from 'lucide-react';
import { useWatchStore } from '@/stores/useWatchStore';

const PAGE_SIZE = 12;

type SortField = 'brand' | 'model' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const getWatchPreviewUrl = (files?: { mimeType?: string | null; type?: string; url: string }[]) => {
    const image = files?.find((file) => (
        file.mimeType?.startsWith('image/')
        || file.type?.toLowerCase().includes('image')
        || /\.(jpe?g|png|webp)$/i.test(file.url)
    ));

    return image ? getApiAssetUrl(image.url) : null;
};

export default function DashboardPage() {
    const router = useRouter();
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const watches = useWatchStore((state) => state.watches);
    const loading = useWatchStore((state) => state.loading);
    const setWatches = useWatchStore((state) => state.setWatches);
    const setLoading = useWatchStore((state) => state.setLoading);

    const sortedWatches = useMemo(() => {
        return [...watches].sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1;
            const aValue = sortField === 'createdAt'
                ? new Date(a.createdAt || 0).getTime()
                : a[sortField].toLowerCase();
            const bValue = sortField === 'createdAt'
                ? new Date(b.createdAt || 0).getTime()
                : b[sortField].toLowerCase();

            if (aValue < bValue) {
                return -1 * direction;
            }

            if (aValue > bValue) {
                return 1 * direction;
            }

            return a.id - b.id;
        });
    }, [sortDirection, sortField, watches]);

    const visibleWatches = sortedWatches.slice(0, visibleCount);
    const hasMoreWatches = visibleCount < sortedWatches.length;

    const handleSort = (field: SortField) => {
        setVisibleCount(PAGE_SIZE);
        if (sortField === field) {
            setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortField(field);
        setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    };

    const getSortLabel = (field: SortField) => {
        if (sortField !== field) {
            return '';
        }

        return sortDirection === 'asc' ? 'Asc' : 'Desc';
    };

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const legacyToken = localStorage.getItem('token');
        if (!legacyToken && !isSignedIn) {
            setAuthChecked(true);
            router.replace('/login');
            return;
        }

        const fetchWatches = async () => {
            setLoading(true);
            try {
                const clerkToken = isSignedIn ? await getToken() : null;
                const res = await api.get('/watches', clerkToken
                    ? {
                        headers: {
                            Authorization: `Bearer ${clerkToken}`,
                        },
                    }
                    : undefined);
                setWatches(res.data);
            } catch (error) {
                console.error('Failed to fetch watches', error);
                setWatches([]);
            } finally {
                setLoading(false);
                setAuthChecked(true);
            }
        };

        fetchWatches();
    }, [getToken, isLoaded, isSignedIn, router, setLoading, setWatches]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [watches.length]);

    useEffect(() => {
        const loadMoreElement = loadMoreRef.current;
        if (!loadMoreElement || !hasMoreWatches) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                setVisibleCount((current) => Math.min(current + PAGE_SIZE, sortedWatches.length));
            }
        }, { rootMargin: '240px' });

        observer.observe(loadMoreElement);

        return () => {
            observer.disconnect();
        };
    }, [hasMoreWatches, sortedWatches.length]);

    if (!authChecked) {
        return (
            <div className="flex min-h-screen flex-col bg-light-grey">
                <Header />

                <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
                    <div className="card-premium">
                        <LoadingSpinner />
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-light-grey">
            <Header />

            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
                {loading && (
                    <div className="card-premium">
                        <LoadingSpinner />
                    </div>
                )}

                {!loading && watches.length === 0 && (
                    <EmptyState
                        icon={<Watch className="w-10 h-10 text-[color:var(--accent-strong)]" />}
                        title="No Watches Yet"
                        description="Start building your collection by minting your first digital passport."
                        actionLabel="Add Your First Watch"
                        actionHref="/watches/new"
                    />
                )}

                {!loading && watches.length > 0 && (
                    <div>
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Collection</p>
                                <h2 className="mt-2 text-[color:var(--ink)]">Your Timepieces</h2>
                                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                    {watches.length} {watches.length === 1 ? 'watch' : 'watches'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    { field: 'createdAt' as const, label: 'Date Added' },
                                    { field: 'brand' as const, label: 'Brand' },
                                    { field: 'model' as const, label: 'Model' },
                                ].map((option) => (
                                    <button
                                        key={option.field}
                                        type="button"
                                        onClick={() => handleSort(option.field)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                            sortField === option.field
                                                ? 'border-[color:var(--accent)] bg-[color:var(--surface-strong)] text-[color:var(--ink)]'
                                                : 'border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:text-[color:var(--ink)]'
                                        }`}
                                    >
                                        {option.label}
                                        <span className="inline-flex min-w-9 items-center justify-end gap-1 text-xs uppercase tracking-[0.14em]">
                                            {getSortLabel(option.field)}
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-premium overflow-hidden p-0">
                            <div className="hidden grid-cols-[72px_minmax(140px,1fr)_minmax(140px,1fr)_minmax(220px,1.35fr)_140px_88px] gap-4 border-b border-[color:var(--line)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:grid">
                                <span>Preview</span>
                                <span>Brand</span>
                                <span>Model</span>
                                <span>Serial Hash</span>
                                <span>Date Added</span>
                                <span className="sr-only">Open</span>
                            </div>

                            <div className="divide-y divide-[color:var(--line)]">
                                {visibleWatches.map((watch) => {
                                    const previewUrl = getWatchPreviewUrl(watch.files);

                                    return (
                                        <Link
                                            key={watch.id}
                                            href={`/watches/${watch.id}`}
                                            className="grid gap-3 px-6 py-5 transition-colors hover:bg-[color:var(--surface-strong)] md:grid-cols-[72px_minmax(140px,1fr)_minmax(140px,1fr)_minmax(220px,1.35fr)_140px_88px] md:items-center md:gap-4"
                                        >
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:hidden">Preview</p>
                                                <div className="h-12 w-16 overflow-hidden rounded border border-[color:var(--line)] bg-[color:var(--surface-strong)]">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt={`${watch.brand} ${watch.model}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Watch className="h-5 w-5 text-[color:var(--accent-strong)] opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:hidden">Brand</p>
                                                <p className="text-lg font-semibold text-[color:var(--ink)]">{watch.brand}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:hidden">Model</p>
                                                <p className="text-base text-[color:var(--ink)]">{watch.model}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:hidden">Serial Hash</p>
                                                <p className="truncate font-mono text-sm text-[color:var(--muted)]">{watch.serialNumberHash}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] md:hidden">Date Added</p>
                                                <p className="text-sm text-[color:var(--muted)]">
                                                    {watch.createdAt
                                                        ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(watch.createdAt))
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">
                                                Open
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {hasMoreWatches && (
                            <div ref={loadMoreRef} className="py-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                Loading more timepieces
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
