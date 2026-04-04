'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import WatchCard from '@/components/WatchCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Watch, TrendingUp, Clock } from 'lucide-react';
import { useWatchStore } from '@/stores/useWatchStore';

export default function DashboardPage() {
    const router = useRouter();
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);
    const watches = useWatchStore((state) => state.watches);
    const loading = useWatchStore((state) => state.loading);
    const setWatches = useWatchStore((state) => state.setWatches);
    const setLoading = useWatchStore((state) => state.setLoading);

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

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-light-grey">
                <Header />

                <main className="mx-auto max-w-7xl px-6 py-12">
                    <div className="card-premium">
                        <LoadingSpinner />
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-grey">
            <Header />

            <main className="mx-auto max-w-7xl px-6 py-12">
                <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="card-premium">
                        <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Dashboard</p>
                        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="text-[color:var(--ink)]">
                                    My Collection
                                </h1>
                                <p className="mt-3 text-lg text-[color:var(--muted)]">
                                    Manage your luxury timepieces and their digital passports.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-start lg:justify-end">
                        <Link href="/watches/new" className="btn-primary">
                            <Plus className="h-5 w-5" />
                            Add Watch
                        </Link>
                    </div>
                </div>

                {!loading && watches.length > 0 && (
                    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-strong)]">
                                    <Watch className="h-6 w-6 text-[color:var(--accent-strong)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">Total Watches</p>
                                    <p className="font-editorial text-5xl text-[color:var(--ink)]">
                                        {watches.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-strong)]">
                                    <TrendingUp className="h-6 w-6 text-[color:var(--accent-strong)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">Collection Value</p>
                                    <p className="font-editorial text-5xl text-[color:var(--ink)]">
                                        Premium
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-strong)]">
                                    <Clock className="h-6 w-6 text-[color:var(--accent-strong)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">Latest Addition</p>
                                    <p className="text-xl font-semibold text-[color:var(--ink)] truncate">
                                        {watches[watches.length - 1]?.brand || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Collection</p>
                                <h2 className="mt-2 text-[color:var(--ink)]">Your Timepieces</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {watches.map((watch) => (
                                <WatchCard
                                    key={watch.id}
                                    id={watch.id}
                                    brand={watch.brand}
                                    model={watch.model}
                                    serialNumberHash={watch.serialNumberHash}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
