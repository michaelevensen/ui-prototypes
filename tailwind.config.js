/** @type {import('tailwindcss').Config} */
module.exports = {
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
        },
    },
    plugins: [
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
