import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "twotop-dark-mode";

export function useDarkMode() {
    const getInitialMode = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) return saved === "true";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const [isDarkMode, setIsDarkMode] = useState(getInitialMode);

    // Listen for system preference changes only when no manual override is saved
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (localStorage.getItem(STORAGE_KEY) === null) {
                setIsDarkMode(e.matches);
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    return { isDarkMode, toggleDarkMode };
}
