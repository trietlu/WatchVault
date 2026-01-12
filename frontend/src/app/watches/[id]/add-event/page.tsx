'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Calendar, MapPin, FileText, Sparkles } from 'lucide-react';

const eventTypeOptions = [
    { value: 'SERVICE', label: 'Service / Repair', icon: '🔧' },
    { value: 'AUTH', label: 'Authentication', icon: '✓' },
    { value: 'TRANSFER', label: 'Ownership Transfer', icon: '↔️' },
    { value: 'NOTE', label: 'Note / Log', icon: '📝' },
];

export default function AddEventPage({ params }: { params: { id: string } }) {
    const [eventType, setEventType] = useState('SERVICE');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            description,
            location,
            date,
            recordedBy: 'Owner',
        };

        try {
            await api.post(`/watches/${params.id}/events`, {
                eventType,
                payload,
            });
            router.push(`/watches/${params.id}`);
        } catch (error) {
            console.error('Failed to add event', error);
            alert('Failed to add event');
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
                    href={`/watches/${params.id}`}
                    className="inline-flex items-center gap-2 text-text-grey hover:text-axels-black transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Watch</span>
                </Link>

                {/* Form Card */}
                <div className="card-premium">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-axels-black/10 text-axels-black mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Lifecycle Event</span>
                        </div>
                        <h1 className="text-4xl font-bold text-black mb-3">
                            Record Event
                        </h1>
                        <p className="text-text-grey text-lg">
                            Add a new event to your watch's history timeline
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Event Type */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-3">
                                Event Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {eventTypeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setEventType(option.value)}
                                        className={`p-4 rounded-lg border-2 transition-all ${eventType === option.value
                                                ? 'border-axels-black bg-axels-black/10'
                                                : 'border-medium-grey bg-white hover:border-axels-black/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <div className={`text-sm font-semibold ${eventType === option.value ? 'text-axels-black' : 'text-dark-grey'
                                            }`}>
                                            {option.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Description
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-text-grey" />
                                <textarea
                                    required
                                    rows={4}
                                    className="input-premium pl-12 resize-none"
                                    placeholder="Describe what happened..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Location / Provider
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
                                <input
                                    type="text"
                                    className="input-premium pl-12"
                                    placeholder="e.g. Rolex Service Center, New York"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
                                <input
                                    type="date"
                                    required
                                    className="input-premium pl-12"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Info Notice */}
                        <div className="p-4 rounded-lg bg-axels-black/10 border border-axels-black/20">
                            <p className="text-sm text-axels-black flex items-start gap-2">
                                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    This event will be cryptographically hashed and can be optionally
                                    anchored to the blockchain for immutable proof.
                                </span>
                            </p>
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
                                        Recording Event...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Record Event
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
