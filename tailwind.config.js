import scrollbarHide from "tailwind-scrollbar-hide";

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "200% 50%" },
                    "100%": { backgroundPosition: "-200% 50%" },
                },
            },
            animation: {
                shimmer: "shimmer 8s linear infinite",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                transitionTimingFunction: {
                    snappy: "cubic-bezier(.32,.72,0,1)",
                    swift: "cubic-bezier(.32,.72,0,1)",
                    google: "cubic-bezier(0.25, 0.8, 0.25, 1)",
                    spring: "linear(0, 0.0018, 0.0069 1.15%, 0.026 2.3%, 0.0637, 0.1135 5.18%, 0.2229 7.78%, 0.5977 15.84%, 0.7014, 0.7904, 0.8641, 0.9228, 0.9676 28.8%, 1.0032 31.68%, 1.0225, 1.0352 36.29%, 1.0431 38.88%, 1.046 42.05%, 1.0448 44.35%, 1.0407 47.23%, 1.0118 61.63%, 1.0025 69.41%, 0.9981 80.35%, 0.9992 99.94%)",
                },
                transitionDuration: {
                    snappy: "400ms",
                    swift: "1800ms",
                    spring: "0.8333s",
                    google: "400ms",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    1: "hsl(var(--chart-1))",
                    2: "hsl(var(--chart-2))",
                    3: "hsl(var(--chart-3))",
                    4: "hsl(var(--chart-4))",
                    5: "hsl(var(--chart-5))",
                    6: "hsl(var(--chart-6))",
                    7: "hsl(var(--chart-7))",
                    8: "hsl(var(--chart-8))",
                    9: "hsl(var(--chart-9))",
                },
            },
        },
    },
    plugins: [
        scrollbarHide,
        function ({ addUtilities }) {
            addUtilities({
                ".shimmer": {
                    "@apply bg-gradient-to-r from-gray-600 via-white to-gray-600 bg-[length:400%_100%] bg-clip-text text-transparent animate-shimmer":
                        {},
                },
            });
        },
    ],
};
