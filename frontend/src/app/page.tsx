'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Watch, Shield, TrendingUp, Clock, ChevronRight, CheckCircle } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-light-grey">
            {/* Navigation */}
            <nav className="bg-axels-black border-b border-axels-black-light sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                    <Image
                        src="/logo.png"
                        alt="WatchVault"
                        width={200}
                        height={80}
                        className="h-20 w-auto"
                        priority
                    />
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="px-4 py-2 transition-colors duration-200 text-white hover:text-axels-black">
                            Sign In
                        </Link>
                        <Link href="/register" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-4 py-2 bg-axels-black/10 rounded-full mb-6">
                                <span className="text-sm font-semibold text-axels-black">Blockchain-Powered Authentication</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                                Digital Passports for Your Luxury Watches
                            </h1>

                            <p className="text-xl text-text-grey mb-8 leading-relaxed">
                                Preserve the legacy of your collection with immutable, blockchain-verified records.
                                Every service, every authentication, every moment—eternally documented.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register" className="btn-primary group">
                                    Start Your Collection
                                    <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/login" className="btn-secondary">
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <div className="card-premium p-8 bg-axels-beige border border-axels-grey">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-axels-black">Immutable Records</h3>
                                            <p className="text-axels-grey-dark text-base">Blockchain-verified provenance that can never be altered</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-axels-black">Complete Timeline</h3>
                                            <p className="text-axels-grey-dark text-base">Track every service and authentication in one place</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-axels-black flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-axels-black">Preserve Value</h3>
                                            <p className="text-axels-grey-dark text-base">Documented history increases resale confidence</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-light-grey">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card-premium text-center p-8">
                            <div className="text-5xl font-bold text-axels-black mb-2">100%</div>
                            <div className="text-dark-grey font-semibold">Tamper-Proof</div>
                            <div className="text-sm text-text-grey mt-2">Blockchain security</div>
                        </div>
                        <div className="card-premium text-center p-8">
                            <div className="text-5xl font-bold text-axels-black mb-2">∞</div>
                            <div className="text-dark-grey font-semibold">Permanent Records</div>
                            <div className="text-sm text-text-grey mt-2">Never lost or deleted</div>
                        </div>
                        <div className="card-premium text-center p-8">
                            <div className="text-5xl font-bold text-axels-black mb-2">24/7</div>
                            <div className="text-dark-grey font-semibold">Global Access</div>
                            <div className="text-sm text-text-grey mt-2">Anytime, anywhere</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                            Everything You Need to Protect Your Collection
                        </h2>
                        <p className="text-xl text-text-grey max-w-3xl mx-auto">
                            Enterprise-grade security meets luxury craftsmanship
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Blockchain Verification</h3>
                            <p className="text-text-grey leading-relaxed">
                                Every transaction and service record is cryptographically secured on the Ethereum blockchain,
                                ensuring your watch's history is permanent and verifiable.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <Clock className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Complete Timeline</h3>
                            <p className="text-text-grey leading-relaxed">
                                Track every moment in your timepiece's journey. Service records, ownership transfers,
                                and authentications—all in one elegant timeline.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <TrendingUp className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Preserve Value</h3>
                            <p className="text-text-grey leading-relaxed">
                                Documented provenance increases resale value and buyer confidence.
                                Your digital passport is the ultimate certificate of authenticity.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <CheckCircle className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Easy Authentication</h3>
                            <p className="text-text-grey leading-relaxed">
                                Generate QR codes for instant verification. Share your watch's authenticated
                                history with potential buyers or insurance companies.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <Watch className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Service History</h3>
                            <p className="text-text-grey leading-relaxed">
                                Log every service, repair, and maintenance event. Upload receipts and photos
                                to create a comprehensive service record.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card-premium hover-lift">
                            <div className="w-14 h-14 rounded-lg bg-axels-black/10 flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-axels-black" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Secure & Private</h3>
                            <p className="text-text-grey leading-relaxed">
                                Your data is encrypted and secure. Control who can view your collection
                                with public and private passport options.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-axels-black">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Begin Your Legacy Today
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Join collectors worldwide who trust WatchVault to preserve their timepiece heritage.
                    </p>
                    <Link href="/register" className="inline-flex items-center px-8 py-4 bg-axels-black text-white font-semibold rounded-lg hover:bg-axels-black-dark transition-all shadow-lg">
                        Create Your Vault
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-medium-grey py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <img
                        src="/logo.png"
                        alt="WatchVault"
                        className="h-8 mb-4"
                    />
                    <p className="text-text-grey text-sm">
                        Securing luxury timepiece provenance on the blockchain
                    </p>
                </div>
            </footer>
        </div>
    );
}
