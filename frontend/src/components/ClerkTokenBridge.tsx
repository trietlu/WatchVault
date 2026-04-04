'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthTokenResolver } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ClerkTokenBridge() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setAuthTokenResolver(null);
            return;
        }

        // When Clerk is active, drop any stale legacy JWT so requests and UI
        // resolve the same user identity.
        if (localStorage.getItem('token')) {
            useAuthStore.getState().logout();
        }

        setAuthTokenResolver(async () => getToken());

        return () => {
            setAuthTokenResolver(null);
        };
    }, [getToken, isLoaded, isSignedIn]);

    return null;
}
