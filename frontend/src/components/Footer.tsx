'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Footer() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const footerColumns = [
        {
            title: 'Collectors',
            links: [
                { href: isAuthenticated ? '/dashboard' : '/login', label: 'My Collection' },
                { href: isAuthenticated ? '/watches/new' : '/register', label: 'Mint a Passport' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { href: '/register', label: 'Create Account' },
                { href: '/#passport-proof', label: 'Security Model' },
            ],
        },
    ];

    return (
        <footer className="mt-20 bg-[color:var(--footer)] text-[color:var(--footer-foreground)]">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start">
                <div className="space-y-6">
                    <div>
                        <Image
                            src="/watchvault_logo.svg"
                            alt="WatchVault"
                            width={210}
                            height={62}
                            className="h-11 w-auto brightness-0 invert"
                        />
                        <h2 className="mt-3 font-editorial text-5xl leading-none text-[color:var(--surface)]">
                            Digital passports for luxury watches.
                        </h2>
                    </div>
                    <p className="max-w-md text-base leading-7 text-[color:var(--footer-muted)]">
                        Secure provenance, service history, ownership transfers, and public passport links in one place.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:w-full lg:max-w-[420px] lg:justify-self-end">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--surface)]">
                                {column.title}
                            </h3>
                            <div className="mt-5 space-y-3">
                                {column.links.map((link) => (
                                    <Link
                                        key={link.href + link.label}
                                        href={link.href}
                                        className="block text-sm text-[color:var(--footer-muted)] transition-colors hover:text-[color:var(--surface)]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10" />
        </footer>
    );
}
