import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { applyThemeToCss } from "../utils";

export function useThemePreference() {
    const { getAccessTokenSilently } = useAuth0();
    const [currentThemeId, setCurrentThemeId] = useState(
        () => localStorage.getItem("twotop-theme-id") || "default-theme",
    );

    const handleThemeChange = async (themeId, onSuccess) => {
        const previousThemeId = currentThemeId;
        setCurrentThemeId(themeId);
        localStorage.setItem("twotop-theme-id", themeId);
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ theme_id: themeId }),
            });
            onSuccess?.();
        } catch (err) {
            setCurrentThemeId(previousThemeId);
            localStorage.setItem("twotop-theme-id", previousThemeId);
        }
    };

    // Preview applies CSS visually without committing state.
    // isDarkMode must be passed in so the correct theme variant is applied.
    const handleThemePreview = (themeId, isDarkMode) => {
        applyThemeToCss(themeId, isDarkMode);
    };

    return {
        currentThemeId,
        handleThemeChange,
        handleThemePreview,
    };
}
