'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Plus, CheckCircle, Clock, Shield, FileText, ExternalLink, Watch as WatchIcon, Upload, Trash2 } from 'lucide-react';

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

export default function WatchDetailPage({ params }: { params: { id: string } }) {
    const [watch, setWatch] = useState<Watch | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchWatch = async () => {
            try {
                const res = await api.get(`/watches/${params.id}`);
                setWatch(res.data);
            } catch (error) {
                console.error('Failed to fetch watch', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatch();
    }, [params.id]);

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

            await api.post(`/watches/${params.id}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh watch data
            const res = await api.get(`/watches/${params.id}`);
            setWatch(res.data);
        } catch (error: any) {
            console.error('Failed to upload image', error);
            alert(error.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleImageDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.delete(`/watches/${params.id}/images/${fileId}`);

            // Refresh watch data
            const res = await api.get(`/watches/${params.id}`);
            setWatch(res.data);
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
            </div>
        );
    }

    const publicUrl = `http://localhost:3000/p/${watch.publicId}`;

    return (
        <div className="min-h-screen bg-light-grey">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-text-grey hover:text-capital-blue transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Watch Info & QR */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Watch Info Card */}
                        <div className="card-premium">
                            {/* Watch Image */}
                            <div className="relative aspect-square rounded-lg overflow-hidden mb-6 bg-light-grey flex items-center justify-center border border-medium-grey">
                                {watch.files && watch.files.length > 0 ? (
                                    <>
                                        <img
                                            src={`http://localhost:3001${watch.files[0].url}`}
                                            alt={`${watch.brand} ${watch.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleImageDelete(watch.files[0].id)}
                                            className="absolute top-2 right-2 p-2 bg-capital-red text-white rounded-full hover:bg-capital-red/90 transition-colors shadow-lg"
                                            title="Delete image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <WatchIcon className="w-24 h-24 text-capital-blue opacity-30" />
                                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors">
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 text-capital-blue mx-auto mb-2" />
                                                <p className="text-sm text-capital-blue font-medium">Upload Image</p>
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

                            {/* Watch Details */}
                            <h1 className="text-3xl font-bold text-black mb-2">
                                {watch.brand}
                            </h1>
                            <p className="text-xl text-text-grey mb-6">{watch.model}</p>

                            {/* Metadata */}
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-light-grey border border-medium-grey">
                                    <span className="block text-xs text-text-grey uppercase tracking-wider mb-1 font-medium">
                                        Serial Hash
                                    </span>
                                    <span className="font-mono text-xs text-dark-grey break-all">
                                        {watch.serialNumberHash}
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg bg-light-grey border border-medium-grey">
                                    <span className="block text-xs text-text-grey uppercase tracking-wider mb-1 font-medium">
                                        Public ID
                                    </span>
                                    <span className="font-mono text-xs text-dark-grey">
                                        {watch.publicId}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Card */}
                        <div className="card-blue text-center">
                            <h3 className="text-lg font-bold text-capital-blue mb-4">
                                Digital Passport QR
                            </h3>
                            <div className="inline-block p-4 bg-white rounded-xl">
                                <QRCode value={publicUrl} size={180} />
                            </div>
                            <Link
                                href={`/p/${watch.publicId}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 mt-4 text-sm text-capital-blue hover:text-capital-blue-dark transition-colors font-medium"
                            >
                                <span>View Public Passport</span>
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="lg:col-span-2">
                        <div className="card-premium min-h-[600px]">
                            {/* Timeline Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-medium-grey">
                                <div>
                                    <h2 className="text-2xl font-bold text-black mb-1">
                                        History Timeline
                                    </h2>
                                    <p className="text-text-grey text-sm">
                                        Track all events and activities for this timepiece
                                    </p>
                                </div>
                                <Link href={`/watches/${watch.id}/add-event`} className="btn-primary">
                                    <span className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Event
                                    </span>
                                </Link>
                            </div>

                            {/* Timeline */}
                            {watch.events.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-capital-blue/10 mb-4">
                                        <Clock className="w-8 h-8 text-capital-blue" />
                                    </div>
                                    <p className="text-text-grey">No events recorded yet</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-capital-blue ml-4 space-y-8">
                                    {watch.events.map((event, index) => {
                                        const payload = JSON.parse(event.payloadJson);
                                        return (
                                            <div key={event.id} className="relative ml-8">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[37px] flex items-center justify-center w-8 h-8 rounded-full bg-capital-blue border-4 border-white shadow-md">
                                                    <div className="text-white">
                                                        {eventIcons[event.eventType] || <FileText className="w-4 h-4" />}
                                                    </div>
                                                </div>

                                                {/* Event Card */}
                                                <div className="bg-white border border-medium-grey rounded-xl p-6 hover:shadow-capital transition-all">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-black mb-1">
                                                                {event.eventType}
                                                            </h3>
                                                            <time className="text-sm text-text-grey">
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

                                                    {/* Event Details */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {Object.entries(payload).map(([key, value]) => (
                                                            <div key={key} className="p-3 rounded-lg bg-light-grey">
                                                                <span className="block text-xs text-text-grey uppercase tracking-wider mb-1 font-medium">
                                                                    {key}
                                                                </span>
                                                                <span className="text-sm text-dark-grey">
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
            </div>
        </div>
    );
}
