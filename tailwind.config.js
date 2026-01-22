/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--bg-app))',
                card: 'hsl(var(--bg-card))',
                primary: 'hsl(var(--primary))',
                accent: 'hsl(var(--accent))',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
