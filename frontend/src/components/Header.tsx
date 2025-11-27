'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Watch, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        // Get user email from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserEmail(userData.email);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-white border-b border-medium-grey sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <Watch className="w-8 h-8 text-capital-blue transition-transform group-hover:scale-110" />
                        <span className="text-2xl font-bold text-capital-blue">
                            WatchVault
                        </span>
                    </Link>

                    {/* User Actions */}
                    <div className="flex items-center gap-4">
                        {/* User Email Display */}
                        {userEmail && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-light-grey rounded-lg">
                                <User className="w-4 h-4 text-capital-blue" />
                                <span className="text-sm text-dark-grey font-medium">{userEmail}</span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-grey hover:bg-light-grey transition-all font-medium"
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
