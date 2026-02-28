'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Header from '@/components/Header';
import WatchCard from '@/components/WatchCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Watch, TrendingUp, Clock } from 'lucide-react';
import { useWatchStore } from '@/stores/useWatchStore';

export default function DashboardPage() {
    const watches = useWatchStore((state) => state.watches);
    const loading = useWatchStore((state) => state.loading);
    const setWatches = useWatchStore((state) => state.setWatches);
    const setLoading = useWatchStore((state) => state.setLoading);

    useEffect(() => {
        const fetchWatches = async () => {
            setLoading(true);
            try {
                const res = await api.get('/watches');
                setWatches(res.data);
            } catch (error) {
                console.error('Failed to fetch watches', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatches();
    }, [setLoading, setWatches]);

    return (
        <div className="min-h-screen bg-light-grey">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
                                My Collection
                            </h1>
                            <p className="text-text-grey text-lg">
                                Manage your luxury timepieces and their digital passports
                            </p>
                        </div>
                        <Link href="/watches/new" className="btn-primary">
                            <span className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Add Watch
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                {!loading && watches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Total Watches */}
                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center">
                                    <Watch className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-text-grey text-sm font-medium">Total Watches</p>
                                    <p className="text-3xl font-bold text-black">
                                        {watches.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Collection Value */}
                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-text-grey text-sm font-medium">Collection Value</p>
                                    <p className="text-3xl font-bold text-black">
                                        Premium
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Latest Addition */}
                        <div className="card-premium">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-text-grey text-sm font-medium">Latest Addition</p>
                                    <p className="text-lg font-bold text-black truncate">
                                        {watches[watches.length - 1]?.brand || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="card-premium">
                        <LoadingSpinner />
                    </div>
                )}

                {/* Empty State */}
                {!loading && watches.length === 0 && (
                    <EmptyState
                        icon={<Watch className="w-10 h-10 text-axels-black" />}
                        title="No Watches Yet"
                        description="Start building your collection by minting your first digital passport"
                        actionLabel="Add Your First Watch"
                        actionHref="/watches/new"
                    />
                )}

                {/* Watch Grid */}
                {!loading && watches.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-6">
                            Your Timepieces
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
        </div>
    );
}
