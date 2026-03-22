'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, LogOut, Plus, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const displayName = user?.name?.trim() || user?.email.split('@')[0] || 'Account';
    const navLinks = isAuthenticated
        ? [
            { href: '/dashboard', label: 'Collection' },
            { href: '/watches/new', label: 'Mint Passport' },
        ]
        : [];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 px-4 py-4 md:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)]/90 px-5 py-3 shadow-[var(--shadow-sm)] backdrop-blur">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/watchvault_logo.svg"
                        alt="WatchVault"
                        width={190}
                        height={56}
                        priority
                        className="h-10 w-auto md:h-11"
                    />
                </Link>

                <nav className="hidden items-center gap-2 lg:flex">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-[color:var(--surface)] text-[color:var(--ink)]'
                                        : 'text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--ink)]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <>
                            <div className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 md:flex">
                                <User className="h-4 w-4 text-[color:var(--accent)]" />
                                <span className="text-sm font-semibold text-[color:var(--ink)]">{displayName}</span>
                            </div>
                            <Link href="/watches/new" className="hidden md:inline-flex btn-secondary">
                                <Plus className="h-4 w-4" />
                                Mint
                            </Link>
                            <button onClick={handleLogout} className="btn-ghost">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn-ghost">
                                Sign In
                            </Link>
                            <Link href="/register" className="btn-primary">
                                Start Your Vault
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
