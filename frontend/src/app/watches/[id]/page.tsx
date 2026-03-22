'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Plus, CheckCircle, Clock, Shield, FileText, ExternalLink, Watch as WatchIcon, Upload, Trash2 } from 'lucide-react';
import { buildPublicPassportUrl, getApiAssetUrl } from '@/lib/config';
import { useWatchStore } from '@/stores/useWatchStore';
import { getErrorMessage } from '@/lib/errors';

interface Event {
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
    events: Event[];
    files: FileRecord[];
}

interface FileRecord {
    id: number;
    url: string;
    type: string;
}

const eventIcons: Record<string, React.ReactNode> = {
    MINT: <Shield className="w-4 h-4" />,
    SERVICE: <Clock className="w-4 h-4" />,
    TRANSFER: <ExternalLink className="w-4 h-4" />,
    AUTH: <FileText className="w-4 h-4" />,
};

export default function WatchDetailPage() {
    const params = useParams<{ id: string }>();
    const watchId = params.id;
    const selectedWatch = useWatchStore((state) => state.selectedWatch);
    const setSelectedWatch = useWatchStore((state) => state.setSelectedWatch);
    const updateWatch = useWatchStore((state) => state.updateWatch);
    const [watch, setWatch] = useState<Watch | null>(
        selectedWatch?.id === Number(watchId) ? selectedWatch as Watch : null
    );
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchWatch = async () => {
            try {
                const res = await api.get(`/watches/${watchId}`);
                setWatch(res.data);
                setSelectedWatch(res.data);
                updateWatch(res.data.id, res.data);
            } catch (error) {
                console.error('Failed to fetch watch', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatch();
    }, [setSelectedWatch, updateWatch, watchId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (8MB)
        if (file.size > 8 * 1024 * 1024) {
            alert('Image must be less than 8MB');
            return;
        }

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            alert('Only JPEG, PNG, and WebP images are allowed');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            await api.post(`/watches/${watchId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh watch data
            const res = await api.get(`/watches/${watchId}`);
            setWatch(res.data);
            setSelectedWatch(res.data);
            updateWatch(res.data.id, res.data);
        } catch (error: unknown) {
            console.error('Failed to upload image', error);
            alert(getErrorMessage(error, 'Failed to upload image'));
        } finally {
            setUploading(false);
        }
    };

    const handleImageDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.delete(`/watches/${watchId}/images/${fileId}`);

            // Refresh watch data
            const res = await api.get(`/watches/${watchId}`);
            setWatch(res.data);
            setSelectedWatch(res.data);
            updateWatch(res.data.id, res.data);
        } catch (error) {
            console.error('Failed to delete image', error);
            alert('Failed to delete image');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light-grey">
                <Header />
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="card-premium">
                        <LoadingSpinner />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!watch) {
        return (
            <div className="min-h-screen bg-light-grey">
                <Header />
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="card-premium text-center py-12">
                        <p className="text-text-grey">Watch not found</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const publicUrl = buildPublicPassportUrl(watch.publicId);

    return (
        <div className="min-h-screen bg-light-grey">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <Link
                    href="/dashboard"
                    className="mb-8 inline-flex items-center gap-2 font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ink)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card-premium">
                            <div className="relative mb-6 aspect-square overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] flex items-center justify-center">
                                {watch.files && watch.files.length > 0 ? (
                                    <>
                                        <img
                                            src={getApiAssetUrl(watch.files[0].url)}
                                            alt={`${watch.brand} ${watch.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleImageDelete(watch.files[0].id)}
                                            className="absolute right-3 top-3 rounded-full bg-[color:var(--footer)] p-2 text-white transition-colors shadow-lg hover:bg-[#30241c]"
                                            title="Delete image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <WatchIcon className="w-24 h-24 text-[color:var(--accent-strong)] opacity-30" />
                                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5">
                                            <div className="text-center">
                                                <Upload className="mx-auto mb-2 h-8 w-8 text-[color:var(--accent-strong)]" />
                                                <p className="text-sm font-medium text-[color:var(--ink)]">Upload Image</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <h1 className="mb-2 text-[color:var(--ink)]">
                                {watch.brand}
                            </h1>
                            <p className="mb-6 text-xl text-[color:var(--muted)]">{watch.model}</p>

                            <div className="space-y-4">
                                <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4">
                                    <span className="mb-1 block text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">
                                        Serial Hash
                                    </span>
                                    <span className="break-all font-mono text-xs text-[color:var(--ink)]">
                                        {watch.serialNumberHash}
                                    </span>
                                </div>
                                <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4">
                                    <span className="mb-1 block text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">
                                        Public ID
                                    </span>
                                    <span className="font-mono text-xs text-[color:var(--ink)]">
                                        {watch.publicId}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card-blue text-center">
                            <h3 className="mb-4 text-[color:var(--ink)]">
                                Digital Passport QR
                            </h3>
                            <div className="inline-block rounded-[24px] bg-white p-4">
                                <QRCode value={publicUrl} size={180} />
                            </div>
                            <Link
                                href={`/p/${watch.publicId}`}
                                target="_blank"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent-strong)] transition-colors hover:text-[color:var(--ink)]"
                            >
                                <span>View Public Passport</span>
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="card-premium min-h-[600px]">
                            <div className="mb-8 flex flex-col gap-4 border-b border-[color:var(--line)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="mb-1 text-[color:var(--ink)]">
                                        History Timeline
                                    </h2>
                                    <p className="text-sm text-[color:var(--muted)]">
                                        Track all events and activities for this timepiece.
                                    </p>
                                </div>
                                <Link href={`/watches/${watch.id}/add-event`} className="btn-primary">
                                    <span className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Event
                                    </span>
                                </Link>
                            </div>

                            {watch.events.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--surface-strong)]">
                                        <Clock className="w-8 h-8 text-[color:var(--accent-strong)]" />
                                    </div>
                                    <p className="text-[color:var(--muted)]">No events recorded yet</p>
                                </div>
                            ) : (
                                <div className="relative ml-4 space-y-8 border-l-2 border-[color:var(--accent-soft)]">
                                    {watch.events.map((event) => {
                                        const payload = JSON.parse(event.payloadJson);
                                        return (
                                            <div key={event.id} className="relative ml-8">
                                                <div className="absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-[color:var(--surface)] bg-[color:var(--accent-strong)] shadow-md">
                                                    <div className="text-white">
                                                        {eventIcons[event.eventType] || <FileText className="w-4 h-4" />}
                                                    </div>
                                                </div>

                                                <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 transition-all hover:shadow-capital">
                                                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-[color:var(--ink)]">
                                                                {event.eventType}
                                                            </h3>
                                                            <time className="text-sm text-[color:var(--muted)]">
                                                                {new Date(event.timestamp).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </time>
                                                        </div>
                                                        <div>
                                                            {event.txHash ? (
                                                                <span className="badge-success">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Anchored
                                                                </span>
                                                            ) : (
                                                                <span className="badge-warning">
                                                                    <Clock className="w-3 h-3" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {Object.entries(payload).map(([key, value]) => (
                                                            <div key={key} className="rounded-[18px] bg-[color:var(--surface-strong)] p-3">
                                                                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
                                                                    {key}
                                                                </span>
                                                                <span className="text-sm text-[color:var(--ink)]">
                                                                    {String(value)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
