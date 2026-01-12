'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-axels-black border-b border-axels-black-light sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-2">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center group">
                        <Image
                            src="/logo.png"
                            alt="WatchVault"
                            width={200}
                            height={80}
                            className="h-20 w-auto transition-transform group-hover:scale-105"
                            priority
                        />
                    </Link>

                    {/* User Actions */}
                    <div className="flex items-center gap-4">
                        {/* User Email Display */}
                        {user && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-axels-black-light rounded-lg">
                                <User className="w-4 h-4 text-axels-black" />
                                <span className="text-sm text-white font-medium">{user.email}</span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-axels-black-light transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
