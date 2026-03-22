'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { CheckCircle, Clock, Shield, FileText, Hash } from 'lucide-react';

interface Event {
    eventType: string;
    payloadHash: string;
    txHash?: string;
    timestamp: string;
    blockNumber?: number | null;
}

interface Watch {
    brand: string;
    model: string;
    serialNumberHash: string;
    publicId: string;
    qrCodeUrl: string;
    events: Event[];
}

export default function PublicPassportPage({ params }: { params: { publicId: string } }) {
    const [watch, setWatch] = useState<Watch | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPassport = async () => {
            try {
                const res = await api.get(`/passports/${params.publicId}`);
                setWatch(res.data);
            } catch (error) {
                console.error('Failed to fetch passport', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPassport();
    }, [params.publicId]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="p-8 text-center text-[color:var(--muted)]">Loading Passport...</div>
                <Footer />
            </div>
        );
    }

    if (!watch) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="p-8 text-center text-[color:var(--muted)]">Passport not found</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <main className="px-6 py-10 md:py-16">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 text-center">
                        <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Public passport</p>
                        <h1 className="mt-4 text-[color:var(--ink)]">WatchVault Passport</h1>
                        <p className="mt-3 text-lg text-[color:var(--muted)]">Verified Digital Provenance</p>
                    </div>

                    <div className="mb-8 overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[var(--shadow-md)]">
                        <div className="h-32 bg-[linear-gradient(135deg,#8b5d47_0%,#c69c81_100%)]"></div>
                        <div className="px-8 pb-8">
                            <div className="relative mb-[-30px] -top-12">
                                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-[color:var(--surface)] bg-[color:var(--surface-strong)] shadow-md">
                                    <span className="text-4xl">WV</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-[color:var(--ink)]">{watch.brand}</h2>
                                <p className="mb-6 text-xl text-[color:var(--muted)]">{watch.model}</p>

                                <div className="grid grid-cols-1 gap-4 rounded-[24px] bg-[color:var(--surface-strong)] p-4 md:grid-cols-2">
                                    <div>
                                        <span className="block text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Serial Hash</span>
                                        <span className="break-all font-mono text-sm text-[color:var(--ink)]">{watch.serialNumberHash}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Passport ID</span>
                                        <span className="font-mono text-sm text-[color:var(--ink)]">{watch.publicId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="px-2 text-[color:var(--ink)]">Provenance Timeline</h3>

                        <div className="relative ml-4 space-y-8 border-l-2 border-[color:var(--accent-soft)] pb-8">
                            {watch.events.map((event, index) => {
                                return (
                                    <div key={index} className="relative ml-8">
                                        <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--line)] bg-[color:var(--surface)]">
                                            {event.eventType === 'MINT' ? <Shield size={14} className="text-[color:var(--accent-strong)]" /> :
                                                event.eventType === 'SERVICE' ? <Clock size={14} className="text-[color:var(--accent-strong)]" /> :
                                                    <FileText size={14} className="text-[color:var(--accent-strong)]" />}
                                        </span>

                                        <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm transition-shadow hover:shadow-md">
                                            <div className="mb-2 flex items-start justify-between gap-4">
                                                <h4 className="text-lg font-semibold text-[color:var(--ink)]">{event.eventType}</h4>
                                                {event.txHash ? (
                                                    <span className="badge-success">
                                                        <CheckCircle size={12} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="badge-warning">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </div>

                                            <time className="mb-4 block text-sm text-[color:var(--muted)]">
                                                {new Date(event.timestamp).toLocaleDateString()}
                                            </time>

                                            <div className="space-y-2 rounded-[18px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 text-sm text-[color:var(--ink)]">
                                                <div className="flex items-start gap-2">
                                                    <Hash size={14} className="mt-0.5 shrink-0 text-[color:var(--accent-strong)]" />
                                                    <div>
                                                        <div className="font-medium opacity-70">Payload Hash</div>
                                                        <div className="break-all font-mono">{event.payloadHash}</div>
                                                    </div>
                                                </div>
                                                {event.txHash && (
                                                    <div>
                                                        <div className="font-medium opacity-70">Transaction</div>
                                                        <div className="break-all font-mono">{event.txHash}</div>
                                                    </div>
                                                )}
                                                {typeof event.blockNumber === 'number' && (
                                                    <div>
                                                        <div className="font-medium opacity-70">Block</div>
                                                        <div>{event.blockNumber}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
