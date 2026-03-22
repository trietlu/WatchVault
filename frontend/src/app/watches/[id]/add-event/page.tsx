'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ArrowLeft, Calendar, MapPin, FileText, Sparkles } from 'lucide-react';
import { useWatchStore } from '@/stores/useWatchStore';

const eventTypeOptions = [
    { value: 'SERVICE', label: 'Service / Repair', icon: 'SR' },
    { value: 'AUTH', label: 'Authentication', icon: 'AT' },
    { value: 'TRANSFER', label: 'Ownership Transfer', icon: 'OT' },
    { value: 'NOTE', label: 'Note / Log', icon: 'NL' },
];

export default function AddEventPage({ params }: { params: { id: string } }) {
    const [eventType, setEventType] = useState('SERVICE');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const selectedWatch = useWatchStore((state) => state.selectedWatch);
    const setSelectedWatch = useWatchStore((state) => state.setSelectedWatch);

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
            const res = await api.post(`/watches/${params.id}/events`, {
                eventType,
                payload,
            });

            if (selectedWatch?.id === Number(params.id)) {
                setSelectedWatch({
                    ...selectedWatch,
                    events: [...(selectedWatch.events ?? []), res.data],
                });
            }
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

            <main className="max-w-3xl mx-auto px-6 py-12">
                <Link
                    href={`/watches/${params.id}`}
                    className="mb-8 inline-flex items-center gap-2 font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ink)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Watch</span>
                </Link>

                <div className="card-premium">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-[color:var(--accent-strong)]">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Lifecycle Event</span>
                        </div>
                        <h1 className="mb-3 text-[color:var(--ink)]">
                            Record Event
                        </h1>
                        <p className="text-lg text-[color:var(--muted)]">
                            Add a new event to your watch&apos;s history timeline
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-[color:var(--ink)]">
                                Event Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {eventTypeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setEventType(option.value)}
                                        className={`rounded-[20px] border-2 p-4 transition-all ${eventType === option.value
                                                ? 'border-[color:var(--accent)] bg-[color:var(--surface-strong)]'
                                                : 'border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent-soft)]'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <div className={`text-sm font-semibold ${eventType === option.value ? 'text-[color:var(--ink)]' : 'text-[color:var(--muted)]'
                                            }`}>
                                            {option.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Description
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-[color:var(--muted)]" />
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

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Location / Provider
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                                <input
                                    type="text"
                                    className="input-premium pl-12"
                                    placeholder="e.g. Rolex Service Center, New York"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                                <input
                                    type="date"
                                    required
                                    className="input-premium pl-12"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4">
                            <p className="flex items-start gap-2 text-sm text-[color:var(--ink)]">
                                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    This event will be cryptographically hashed and can be optionally
                                    anchored to the blockchain for immutable proof.
                                </span>
                            </p>
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
            </main>

            <Footer />
        </div>
    );
}
