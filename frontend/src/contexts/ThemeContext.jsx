import { createContext, useContext } from "react";
import { useThemePreference } from "../hooks/useThemePreference";
import { useDarkMode } from "../hooks/useDarkMode";

const ThemeContext = createContext(null);

export function ThemeProvider({ children, onThemeApplied }) {
    const { currentThemeId, handleThemeChange, handleThemePreview } =
        useThemePreference();

    const { isDarkMode, colorMode, setColorMode } = useDarkMode();

    return (
        <ThemeContext.Provider
            value={{
                currentThemeId,
                handleThemeChange: (themeId) =>
                    handleThemeChange(themeId, onThemeApplied),
                handleThemePreview: (themeId) =>
                    handleThemePreview(themeId, isDarkMode),
                isDarkMode,
                colorMode,
                setColorMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
