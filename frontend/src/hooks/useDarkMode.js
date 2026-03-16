import { useState, useEffect } from "react";

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference on mount
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        setIsDarkMode(prefersDark);

        // Listen for changes in system preference
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return isDarkMode;
}
