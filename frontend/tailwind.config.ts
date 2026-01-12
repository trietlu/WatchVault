import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                axels: {
                    white: '#FFFFFF',
                    black: '#000000',
                    beige: '#F5F5F0',
                    cream: '#FAF9F6',
                    grey: {
                        light: '#F8F8F8',
                        DEFAULT: '#E5E5E5',
                        dark: '#666666',
                    },
                    text: '#1A1A1A',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
                display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
            },
            letterSpacing: {
                tighter: '-0.05em',
                tight: '-0.03em',
                normal: '0.01em',
                wide: '0.05em',
                wider: '0.1em',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
        },
    },
    plugins: [],
};

export default config;
