import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import ClerkTokenBridge from '@/components/ClerkTokenBridge';
import "./globals.css";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    variable: '--font-editorial',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: "WatchVault",
    description: "Digital Passports for Luxury Watches",
    icons: {
        icon: '/watchvault_favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    return (
        <html lang="en">
            <body className={`${cormorant.variable} ${manrope.variable}`}>
                <ClerkProvider
                    signInForceRedirectUrl="/dashboard"
                    signUpForceRedirectUrl="/dashboard"
                >
                    <ClerkTokenBridge />
                    <GoogleOAuthProvider clientId={googleClientId}>
                        {children}
                    </GoogleOAuthProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
