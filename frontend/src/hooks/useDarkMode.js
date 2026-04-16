import { useState, useEffect, useCallback } from "react";

const MODE_KEY = "twotop-color-mode";
const LEGACY_KEY = "twotop-dark-mode";

const getSystemDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialMode = () => {
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
    const [systemDark, setSystemDark] = useState(getSystemDark);

    const isDarkMode =
        colorMode === "dark" || (colorMode === "system" && systemDark);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setSystemDark(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const setColorMode = useCallback((mode) => {
        setColorModeState(mode);
        if (mode === "system") {
            localStorage.removeItem(MODE_KEY);
        } else {
            localStorage.setItem(MODE_KEY, mode);
        }
    }, []);

    return { isDarkMode, colorMode, setColorMode };
}
