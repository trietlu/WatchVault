'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Header from '@/components/Header';
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
    const router = useRouter();
    const addWatch = useWatchStore((state) => state.addWatch);

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

    return (
        <div className="min-h-screen bg-light-grey">
            <Header />

            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-text-grey hover:text-axels-black transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </Link>

                {/* Form Card */}
                <div className="card-premium">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-axels-black/10 text-axels-black mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Digital Passport</span>
                        </div>
                        <h1 className="text-4xl font-bold text-black mb-3">
                            Mint New Watch
                        </h1>
                        <p className="text-text-grey text-lg">
                            Create a blockchain-secured digital passport for your timepiece
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-axels-black/10 border border-axels-black/20">
                            <p className="text-axels-black text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Watch Image (Optional)
                            </label>
                            {!imagePreview ? (
                                <label className="block cursor-pointer">
                                    <div className="border-2 border-dashed border-medium-grey rounded-lg p-8 text-center hover:border-axels-black hover:bg-axels-black/5 transition-all">
                                        <Upload className="w-12 h-12 text-text-grey mx-auto mb-3" />
                                        <p className="text-dark-grey font-medium mb-1">Click to upload image</p>
                                        <p className="text-sm text-text-grey">JPEG, PNG, or WebP (max 8MB)</p>
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
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-axels-black text-white rounded-full hover:bg-axels-black/90 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Brand Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Brand
                            </label>
                            <div className="relative">
                                <Watch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
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

                        {/* Model Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
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

                        {/* Serial Number Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
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
                            <div className="mt-3 p-4 rounded-lg bg-axels-black/10 border border-axels-black/20">
                                <p className="text-sm text-axels-black flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Your serial number will be cryptographically hashed before storage.
                                        We never store the raw serial number for maximum security.
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
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

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="card-premium text-center">
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="text-sm text-text-grey font-medium">Blockchain Secured</p>
                    </div>
                    <div className="card-premium text-center">
                        <div className="text-2xl mb-2">📱</div>
                        <p className="text-sm text-text-grey font-medium">QR Code Access</p>
                    </div>
                    <div className="card-premium text-center">
                        <div className="text-2xl mb-2">📜</div>
                        <p className="text-sm text-text-grey font-medium">Complete History</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
