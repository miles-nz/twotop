import { useState, useEffect, useCallback } from "react";

const MODE_KEY = "twotop-color-mode";
const LEGACY_KEY = "twotop-dark-mode";

const getSystemDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialMode = () => {
    // Migrate from legacy boolean key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
        const migrated = legacy === "true" ? "dark" : "light";
        localStorage.setItem(MODE_KEY, migrated);
        localStorage.removeItem(LEGACY_KEY);
        return migrated;
    }
    return localStorage.getItem(MODE_KEY) || "system";
};

export function useDarkMode() {
    const [colorMode, setColorModeState] = useState(getInitialMode);

    const isDarkMode =
        colorMode === "dark" || (colorMode === "system" && getSystemDark());

    // Listen for system preference changes when in system mode
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (colorMode === "system") {
                // Force re-render by nudging state
                setColorModeState((prev) => prev);
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [colorMode]);

    const setColorMode = useCallback((mode) => {
        setColorModeState(mode);
        if (mode === "system") {
            localStorage.removeItem(MODE_KEY);
        } else {
            localStorage.setItem(MODE_KEY, mode);
        }
    }, []);

    // Keep toggleDarkMode for any existing consumers
    return { isDarkMode, colorMode, setColorMode };
}
