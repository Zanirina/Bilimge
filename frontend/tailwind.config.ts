import type { Config } from "tailwindcss";

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3356AA",
                secondary: "#E95C4B",
                primary_text: "#111928",
                secondary_text: "#4B5563",
                stroke: "#DFE4EA",
            },
        },
    },
    plugins: [],
} satisfies Config;