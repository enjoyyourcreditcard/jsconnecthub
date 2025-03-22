import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
        tailwindcss("./tailwind.config.js"),
    ],
    css: {
        postcss: {
            plugins: [tailwindcss],
        },
    },
});
