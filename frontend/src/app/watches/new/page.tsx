'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Watch, Sparkles, Upload, X } from 'lucide-react';
import { useWatchStore } from '@/stores/useWatchStore';
import { getErrorMessage } from '@/lib/errors';

export default function NewWatchPage() {
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();
    const addWatch = useWatchStore((state) => state.addWatch);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthChecked(true);
            router.replace('/login');
            return;
        }

        setAuthChecked(true);
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (8MB)
            if (file.size > 8 * 1024 * 1024) {
                setError('Image must be less than 8MB');
                return;
            }

            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
                setError('Only JPEG, PNG, and WebP images are allowed');
                return;
            }

            setError('');
            setImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!localStorage.getItem('token')) {
            router.replace('/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('brand', brand);
            formData.append('model', model);
            formData.append('serialNumber', serialNumber);
            if (image) {
                formData.append('image', image);
            }

            const res = await api.post('/watches', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            addWatch({
                ...res.data.watch,
                events: [],
                files: [],
            });
            router.push('/dashboard');
        } catch (error: unknown) {
            console.error('Failed to create watch', error);
            setError(getErrorMessage(error, 'Failed to create watch'));
        } finally {
            setLoading(false);
        }
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-light-grey">
                <Header />

                <main className="mx-auto max-w-3xl px-6 py-12">
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

            <main className="mx-auto max-w-3xl px-6 py-12">
                <Link
                    href="/dashboard"
                    className="mb-8 inline-flex items-center gap-2 font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ink)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </Link>

                <div className="card-premium">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-[color:var(--accent-strong)]">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Digital Passport</span>
                        </div>
                        <h1 className="mb-3 text-[color:var(--ink)]">
                            Mint New Watch
                        </h1>
                        <p className="text-lg text-[color:var(--muted)]">
                            Create a blockchain-secured digital passport for your timepiece.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-[20px] border border-[#d7b0aa] bg-[#f8ece9] p-4">
                            <p className="text-sm text-[color:var(--danger)]">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Watch Image (Optional)
                            </label>
                            {!imagePreview ? (
                                <label className="block cursor-pointer">
                                    <div className="rounded-[24px] border-2 border-dashed border-[color:var(--line)] p-8 text-center transition-all hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-strong)]">
                                        <Upload className="mx-auto mb-3 h-12 w-12 text-[color:var(--muted)]" />
                                        <p className="mb-1 font-medium text-[color:var(--ink)]">Click to upload image</p>
                                        <p className="text-sm text-[color:var(--muted)]">JPEG, PNG, or WebP (max 8MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Watch preview"
                                        className="h-64 w-full rounded-[24px] object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute right-3 top-3 rounded-full bg-[color:var(--footer)] p-2 text-white transition-colors hover:bg-[#30241c]"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Brand
                            </label>
                            <div className="relative">
                                <Watch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" />
                                <input
                                    type="text"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="e.g. Rolex, Patek Philippe, Audemars Piguet"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Model
                            </label>
                            <input
                                type="text"
                                required
                                className="input-premium"
                                placeholder="e.g. Submariner, Nautilus, Royal Oak"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Serial Number
                            </label>
                            <input
                                type="text"
                                required
                                className="input-premium font-mono"
                                placeholder="Enter the watch's serial number"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                            />
                            <div className="mt-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4">
                                <p className="flex items-start gap-2 text-sm text-[color:var(--ink)]">
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Your serial number will be cryptographically hashed before storage.
                                        We never store the raw serial number for maximum security.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Minting Passport...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Mint Digital Passport
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="card-premium text-center">
                        <div className="mb-2 text-2xl">Blockchain</div>
                        <p className="text-sm font-medium text-[color:var(--muted)]">Blockchain Secured</p>
                    </div>
                    <div className="card-premium text-center">
                        <div className="mb-2 text-2xl">Passport</div>
                        <p className="text-sm font-medium text-[color:var(--muted)]">QR Code Access</p>
                    </div>
                    <div className="card-premium text-center">
                        <div className="mb-2 text-2xl">Timeline</div>
                        <p className="text-sm font-medium text-[color:var(--muted)]">Complete History</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
