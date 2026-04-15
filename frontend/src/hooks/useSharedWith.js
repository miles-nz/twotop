import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function useSharedWith() {
    const { getAccessTokenSilently } = useAuth0();
    const [sharedWith, setSharedWith] = useState([]);

    const fetchSharedWith = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/preferences`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (response.ok) {
                setSharedWith(data.shared_with || []);
            }
        } catch (err) {
            console.error("Failed to fetch shared_with:", err);
        }
    };

    const handleSharedWithChange = async (newSharedWith) => {
        const previousSharedWith = sharedWith;
        setSharedWith(newSharedWith);
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ shared_with: newSharedWith }),
            });
        } catch (err) {
            setSharedWith(previousSharedWith);
            console.error("Failed to update shared_with:", err);
        }
    };

    return {
        sharedWith,
        fetchSharedWith,
        handleSharedWithChange,
    };
}
