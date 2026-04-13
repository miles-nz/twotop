import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { isDefaultAvatar } from "../utils";

export function useUserPicture() {
    const { getAccessTokenSilently } = useAuth0();
    const [currentUserPicture, setCurrentUserPicture] = useState(undefined);

    const fetchCurrentPicture = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/picture`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (response.ok)
                setCurrentUserPicture(
                    isDefaultAvatar(data.picture) ? null : data.picture,
                );
        } catch (err) {
            setCurrentUserPicture(null);
        }
    };

    return { currentUserPicture, setCurrentUserPicture, fetchCurrentPicture };
}
