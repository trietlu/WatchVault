'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, Clock, Shield, FileText } from 'lucide-react';

interface Event {
    eventType: string;
    payloadHash: string;
    txHash?: string;
    timestamp: string;
    payloadJson?: string;
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

    if (loading) return <div className="p-8 text-center">Loading Passport...</div>;
    if (!watch) return <div className="p-8 text-center">Passport not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">WatchVault Passport</h1>
                    <p className="text-gray-500 dark:text-gray-400">Verified Digital Provenance</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -top-12 mb-[-30px]">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-zinc-900 rounded-full border-4 border-white dark:border-zinc-900 shadow-md">
                                <span className="text-4xl">⌚️</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{watch.brand}</h2>
                            <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{watch.model}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Serial Hash</span>
                                    <span className="font-mono text-sm break-all">{watch.serialNumberHash}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Passport ID</span>
                                    <span className="font-mono text-sm">{watch.publicId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Provenance Timeline</h3>

                    <div className="relative border-l-2 border-gray-200 dark:border-zinc-700 ml-4 space-y-8 pb-8">
                        {watch.events.map((event, index) => {
                            let payload = {};
                            try {
                                if (event.payloadJson) payload = JSON.parse(event.payloadJson);
                            } catch (e) { }

                            return (
                                <div key={index} className="ml-8 relative">
                                    <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-zinc-700">
                                        {event.eventType === 'MINT' ? <Shield size={14} className="text-blue-600" /> :
                                            event.eventType === 'SERVICE' ? <Clock size={14} className="text-blue-600" /> :
                                                <FileText size={14} className="text-blue-600" />}
                                    </span>

                                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{event.eventType}</h4>
                                            {event.txHash ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-yellow-600 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </div>

                                        <time className="block text-sm text-gray-500 mb-4">
                                            {new Date(event.timestamp).toLocaleDateString()}
                                        </time>

                                        {Object.keys(payload).length > 0 && (
                                            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded border border-gray-100 dark:border-zinc-700/50">
                                                {Object.entries(payload).map(([key, value]) => (
                                                    <div key={key} className="grid grid-cols-3 gap-2 mb-1 last:mb-0">
                                                        <span className="font-medium capitalize opacity-70">{key}:</span>
                                                        <span className="col-span-2">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
