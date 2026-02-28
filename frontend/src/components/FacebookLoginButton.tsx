'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FacebookLogin } from 'react-facebook-login-component';
import type { FacebookLoginResponse } from 'react-facebook-login-component';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/lib/errors';

export default function FacebookLoginButton() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const loginToStore = useAuthStore((state) => state.login);

    const responseFacebook = async (response: FacebookLoginResponse) => {
        if (response.accessToken) {
            setLoading(true);
            setError('');

            try {
                // Send the access token to our backend
                const res = await api.post('/auth/facebook', {
                    token: response.accessToken,
                    userID: response.userID
                });

                loginToStore(res.data.token, res.data.user);

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error: unknown) {
                console.error('Facebook login error:', error);
                setError(getErrorMessage(error, 'Facebook login failed. Please try again.'));
            } finally {
                setLoading(false);
            }
        } else {
            setError('Facebook login was cancelled or failed.');
        }
    };

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

    if (!appId) {
        return (
            <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                    Facebook Login is not configured. Please add NEXT_PUBLIC_FACEBOOK_APP_ID to your .env.local file.
                </p>
            </div>
        );
    }

    return (
        <div>
            <FacebookLogin
                appId={appId}
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                cssClass="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-medium-grey rounded-lg hover:bg-light-grey transition-all cursor-pointer"
                textButton={loading ? 'Signing in...' : 'Continue with Facebook'}
                icon={
                    loading ? (
                        <div className="w-5 h-5 border-2 border-capital-blue border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    )
                }
            />
            {error && (
                <p className="text-capital-red text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
