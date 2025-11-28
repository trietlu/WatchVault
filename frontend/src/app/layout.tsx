import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "WatchVault",
    description: "Digital Passports for Luxury Watches",
    icons: {
        icon: '/favicon.png',
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
            <body className={inter.className}>
                <GoogleOAuthProvider clientId={googleClientId}>
                    {children}
                </GoogleOAuthProvider>
            </body>
        </html>
    );
}
