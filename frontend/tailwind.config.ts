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
                black: '#212121',
                white: '#FFFFFF',
                'light-grey': '#F7F8F9',
                'medium-grey': '#D7DDE0',
                'text-grey': '#353839B3',
                'dark-grey': '#212121',
                'border-grey': '#21212126',
                'capital-blue': '#353839',
                'capital-red': '#EA384C',
                'accent-yellow': '#353839',
                axels: {
                    white: '#FFFFFF',
                    black: '#212121',
                    'black-light': '#353839',
                    'black-dark': '#111315',
                    beige: '#F4F6F7',
                    cream: '#F7F8F9',
                    grey: {
                        light: '#FAFBFB',
                        DEFAULT: '#D7DDE0',
                        dark: '#353839B3',
                    },
                    text: '#212121',
                    gold: '#353839',
                },
                watchvault: {
                    ink: '#212121',
                    steel: '#353839',
                    graphite: '#111315',
                    mist: '#F7F8F9',
                    line: '#D7DDE0',
                },
            },
            fontFamily: {
                sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                serif: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                display: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
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
