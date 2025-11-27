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
                capital: {
                    blue: {
                        DEFAULT: '#004879',
                        light: '#0066A1',
                        dark: '#003557',
                    },
                    red: {
                        DEFAULT: '#D22E1E',
                        light: '#E84A3D',
                        dark: '#A82318',
                    },
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    light: '#F4E4B7',
                    dark: '#B8941E',
                },
                navy: {
                    DEFAULT: '#0A1628',
                    light: '#1A2942',
                    lighter: '#2A3952',
                },
                cream: '#F5F5F0',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
