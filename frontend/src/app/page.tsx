'use client';

import Image from 'next/image';
import { CheckCircle2, Shield, Watch } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const collectionMoments = [
    {
        title: 'Easy Authentication',
        description: 'Generate QR codes for instant verification. Share your authenticated history with potential buyers or insurance companies.',
        icon: CheckCircle2,
    },
    {
        title: 'Service History',
        description: 'Log every service, repair, and maintenance event. Upload receipts and photos to create a comprehensive immutable service record stored on the Blockchain.',
        icon: Watch,
    },
    {
        title: 'Secure & Private',
        description: 'Your data is encrypted and secure. Control who can view your collection with public and private passport options.',
        icon: Shield,
    },
];

export default function Home() {
    return (
        <div className="min-h-screen">
            <Header />

            <main>
                <section className="px-6 pb-8 pt-6 md:pb-12 md:pt-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="space-y-8">
                            <div>
                                <p className="mb-5 text-sm uppercase tracking-[0.32em] text-[color:var(--muted)]">
                                    Blockchain-Powered Authentication
                                </p>
                                <h1 className="w-full text-[color:var(--ink)] text-[clamp(40px,5vw,72px)] lg:whitespace-nowrap">
                                    Digital Passports for Your Luxury Watches
                                </h1>
                            </div>

                            <div>
                                <p className="w-full text-lg leading-8 text-[color:var(--muted)] md:text-xl">
                                    Preserve the legacy of your collection with blockchain-verified authenticity and comprehensive service records.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="passport-proof" className="px-6 py-6 md:py-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-4 md:grid-cols-3">
                            {collectionMoments.map((moment) => {
                                const Icon = moment.icon;
                                return (
                                    <div key={moment.title} className="card-premium">
                                        <div className="inline-flex rounded-full bg-[color:var(--surface-strong)] p-3">
                                            <Icon className="h-5 w-5 text-[color:var(--accent-strong)]" />
                                        </div>
                                        <p className="mt-6 font-editorial text-3xl text-[color:var(--ink)]">{moment.title}</p>
                                        <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">{moment.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-12 pt-6 md:pb-16 md:pt-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative">
                            <div className="card-premium overflow-hidden p-4 md:p-5">
                                <div className="relative h-[420px] overflow-hidden rounded-[24px] md:h-[520px]">
                                    <Image
                                        src="/pexels-bemistermister-380782.jpg"
                                        alt="Luxury watch collection"
                                        fill
                                        sizes="100vw"
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1712b8] via-transparent to-[#f4ede31f]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
