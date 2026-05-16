'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const { user, isAuthenticated, logout } = useAuthStore();
    const signedIn = isAuthenticated || isSignedIn;
    const displayName = user?.name?.trim() || user?.email.split('@')[0] || 'Account';
    const navLinks = signedIn
        ? [
            { href: '/dashboard', label: 'Collection' },
            { href: '/watches/new', label: 'Add Watch' },
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

                <div className="flex items-center gap-3">
                    {signedIn && (
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
                    )}

                    {isAuthenticated && user ? (
                        <>
                            <div className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 md:flex">
                                <User className="h-4 w-4 text-[color:var(--accent)]" />
                                <span className="text-sm font-semibold text-[color:var(--ink)]">{displayName}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-ghost">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Show when="signed-out">
                                <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
                                    <button type="button" className="btn-ghost">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal" forceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard">
                                    <button type="button" className="btn-primary">
                                        Start Your Vault
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </SignUpButton>
                            </Show>
                            <Show when="signed-in">
                                <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] p-1">
                                    <UserButton />
                                </div>
                            </Show>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
