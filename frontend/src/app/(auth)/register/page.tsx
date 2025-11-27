'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Watch, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-grey flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Watch className="w-10 h-10 text-capital-blue" />
                    <span className="text-3xl font-bold text-capital-blue">WatchVault</span>
                </Link>

                {/* Register Card */}
                <div className="card-premium p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                        <p className="text-text-grey">Start preserving your collection</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
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

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
                                <input
                                    type="password"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-text-grey mt-1">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-dark-grey mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-grey" />
                                <input
                                    type="password"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-lg bg-capital-red/10 border border-capital-red/20">
                                <p className="text-capital-red text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-medium-grey"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-text-grey">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        href="/login"
                        className="btn-secondary w-full text-center block"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-text-grey text-sm mt-8">
                    Secured by blockchain technology
                </p>
            </div>
        </div>
    );
}
