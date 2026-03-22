'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import FacebookLoginButton from '@/components/FacebookLoginButton';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/lib/errors';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/register', { email, password });
            login(res.data.token, res.data.user);
            router.push('/dashboard');
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="px-6 py-10 md:py-16">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="card-premium flex flex-col justify-between gap-10">
                        <div>
                            <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Create account</p>
                            <h1 className="mt-4 text-[color:var(--ink)]">Create Account</h1>
                            <p className="mt-5 max-w-lg text-base leading-7 text-[color:var(--muted)]">
                                Start preserving your collection with blockchain-secured digital passports.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-[24px] bg-[color:var(--surface-strong)] p-5">
                                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">Security</p>
                                <p className="mt-3 text-lg text-[color:var(--ink)]">Raw serial numbers stay hashed before they persist.</p>
                            </div>
                            <div className="rounded-[24px] bg-[color:var(--surface-strong)] p-5">
                                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">Passports</p>
                                <p className="mt-3 text-lg text-[color:var(--ink)]">Generate public passports and manage your watch history in one place.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-8 md:p-10">
                        <div className="mb-8">
                            <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--muted)]">Register</p>
                            <h2 className="mt-3 text-[color:var(--ink)]">Start preserving your collection.</h2>
                            <p className="mt-3 text-base text-[color:var(--muted)]">Use social auth or create an account with email.</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            <GoogleLoginButton />
                            <FacebookLoginButton />
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[color:var(--line)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[color:var(--surface)] px-4 text-[color:var(--muted)]">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" />
                                    <input
                                        type="email"
                                        required
                                        className="input-premium pl-12"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" />
                                    <input
                                        type="password"
                                        required
                                        className="input-premium pl-12"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-[color:var(--muted)]">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" />
                                    <input
                                        type="password"
                                        required
                                        className="input-premium pl-12"
                                        placeholder="********"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-[20px] border border-[#d7b0aa] bg-[#f8ece9] p-4">
                                    <p className="text-sm text-[color:var(--danger)]">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[color:var(--line)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[color:var(--surface)] px-4 text-[color:var(--muted)]">Already have an account?</span>
                            </div>
                        </div>

                        <Link href="/login" className="btn-secondary w-full">
                            Sign In
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
