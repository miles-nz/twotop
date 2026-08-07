import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function useUserPreferences() {
    const { getAccessTokenSilently } = useAuth0();
    const [currentThemeId, setCurrentThemeId] = useState(
        () => localStorage.getItem("twotop-theme-id") || "default-theme",
    );
    const [sharedWith, setSharedWith] = useState([]);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
    const [hasSeenNamePrompt, setHasSeenNamePrompt] = useState(false);
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);

    const fetchPreferences = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/preferences`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (response.ok) {
                const themeId = data.theme_id || "default-theme";
                setCurrentThemeId(themeId);
                localStorage.setItem("twotop-theme-id", themeId);
                setSharedWith(data.shared_with || []);
                setHasSeenTutorial(data.has_seen_tutorial === true);
                setHasSeenNamePrompt(data.has_seen_name_prompt === true);
                setPreferencesLoaded(true);
            }
        } catch (err) {
            console.error("Failed to fetch user preferences:", err);
        }
    };

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
            onSuccess?.();
        }
    };

    const handleSharedWithChange = (newSharedWith) => {
        setSharedWith(newSharedWith);
    };

    const markTutorialSeen = async () => {
        setHasSeenTutorial(true);
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ has_seen_tutorial: true }),
            });
        } catch (err) {
            console.error("Failed to mark tutorial seen:", err);
            setHasSeenTutorial(false);
        }
    };

    const handleThemePreview = (themeId) => {
        setCurrentThemeId(themeId);
    };

    const markNamePromptSeen = async () => {
        setHasSeenNamePrompt(true);
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ has_seen_name_prompt: true }),
            });
        } catch (err) {
            console.error("Failed to mark name modal dismissed:", err);
            setHasSeenNamePrompt(false);
        }
    };

    return {
        currentThemeId,
        setCurrentThemeId,
        sharedWith,
        fetchPreferences,
        handleThemeChange,
        handleSharedWithChange,
        handleThemePreview,
        hasSeenTutorial,
        markTutorialSeen,
        hasSeenNamePrompt,
        markNamePromptSeen,
        preferencesLoaded,
    };
}
