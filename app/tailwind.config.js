/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#e8306e",
                "primary-light": "#fce7ef",
                "background-light": "#fdf8f9",
                "background-dark": "#211116",
                "surface-dark": "#3a1e27",
                "surface-light": "#ffffff",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "full": "9999px"
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                'champagne-gradient': 'linear-gradient(to bottom right, #211116, #3a1e27)',
            }
        },
    },
    plugins: [],
}
