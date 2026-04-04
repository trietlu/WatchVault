'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthTokenResolver } from '@/lib/api';

export default function ClerkTokenBridge() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setAuthTokenResolver(null);
            return;
        }

        setAuthTokenResolver(async () => getToken());

        return () => {
            setAuthTokenResolver(null);
        };
    }, [getToken, isLoaded, isSignedIn]);

    return null;
}
