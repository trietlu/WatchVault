import type { Metadata } from "next";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

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
            <body
                className="font-sans"
                style={{
                    ['--font-inter' as string]: '"DM Sans"',
                    ['--font-playfair' as string]: '"Playfair Display"',
                }}
            >
                <GoogleOAuthProvider clientId={googleClientId}>
                    {children}
                </GoogleOAuthProvider>
            </body>
        </html>
    );
}
