/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Matches App.tsx, index.tsx, etc. in root
    ],
    theme: {
        extend: {
            fontFamily: {
                persian: ['Vazirmatn', 'sans-serif'],
                english: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
