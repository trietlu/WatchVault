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
                black: '#222222',
                white: '#FFFFFF',
                'light-grey': '#FAF9F7',
                'medium-grey': '#ECE8E3',
                'text-grey': '#222222B3',
                'dark-grey': '#222222',
                'border-grey': '#22222226',
                'capital-blue': '#B59A6C',
                'capital-red': '#EA384C',
                'accent-yellow': '#B59A6C',
                axels: {
                    white: '#FFFFFF',
                    black: '#222222',
                    'black-light': '#2F2F2F',
                    'black-dark': '#141414',
                    beige: '#F5F5F0',
                    cream: '#FAF9F6',
                    grey: {
                        light: '#FAFAFA',
                        DEFAULT: '#ECE8E3',
                        dark: '#222222B3',
                    },
                    text: '#222222',
                    gold: '#B59A6C',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
                display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
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
