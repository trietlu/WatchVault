import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import api from './api';
import { getErrorMessage } from './errors';
import type { User } from '../types/models';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResponse {
  token: string;
  user: User;
}

const googleClientIds = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export const useGoogleAuth = (onSuccess: (token: string, user: User) => void) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isExpoGo = Constants.appOwnership === 'expo';
  const expoProxyRedirectUri = useMemo(() => {
    if (!isExpoGo) {
      return undefined;
    }

    try {
      return AuthSession.getRedirectUrl();
    } catch {
      return AuthSession.makeRedirectUri();
    }
  }, [isExpoGo]);
  const expoGoClientId = googleClientIds.expoClientId ?? googleClientIds.webClientId;

  const hasGoogleClientId = useMemo(
    () =>
      isExpoGo
        ? Boolean(expoGoClientId?.trim())
        : Object.values(googleClientIds).some((value) => Boolean(value?.trim())),
    [expoGoClientId, isExpoGo]
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...(isExpoGo
      ? {
          clientId: expoGoClientId,
          webClientId: expoGoClientId,
          redirectUri: expoProxyRedirectUri,
        }
      : googleClientIds),
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    const finishGoogleSignIn = async () => {
      if (!response) {
        return;
      }

      if (response.type !== 'success') {
        if (response.type === 'error') {
          const authError =
            (response as unknown as { params?: { error_description?: string } }).params
              ?.error_description ?? 'Google sign-in failed. Please try again.';
          setError(authError);
        }
        return;
      }

      const accessToken = response.authentication?.accessToken;
      if (!accessToken) {
        setError('Google sign-in did not return an access token.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await api.post<GoogleAuthResponse>('/auth/google', {
          token: accessToken,
        });
        onSuccess(res.data.token, res.data.user);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Google sign-in failed.'));
      } finally {
        setLoading(false);
      }
    };

    void finishGoogleSignIn();
  }, [onSuccess, response]);

  const signInWithGoogle = useCallback(async () => {
    setError('');

    if (isExpoGo) {
      setError(
        'Google sign-in is not supported in Expo Go. Use a development build (npm run ios / npm run android).'
      );
      return;
    }

    if (!hasGoogleClientId) {
      setError(
        isExpoGo
          ? 'Google sign-in is not configured for Expo Go. Set EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID or EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in native/.env.'
          : 'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_*_CLIENT_ID in native/.env.'
      );
      return;
    }

    if (!request) {
      setError('Google sign-in is still initializing. Please try again.');
      return;
    }

    try {
      await promptAsync();
    } catch {
      setError('Unable to open Google sign-in.');
    }
  }, [hasGoogleClientId, isExpoGo, promptAsync, request]);

  return {
    googleError: error,
    googleLoading: loading,
    googleDisabled: loading,
    signInWithGoogle,
    clearGoogleError: () => setError(''),
  };
};
