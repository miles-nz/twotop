import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { isDefaultAvatar } from "../utils";

export function useCurrentUser() {
    const { getAccessTokenSilently } = useAuth0();
    const [currentUserPicture, setCurrentUserPicture] = useState(undefined);
    const [currentUserName, setCurrentUserName] = useState(
        localStorage.getItem("twotop-user-name"),
    );

    const fetchCurrentUser = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/me`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (response.ok) {
                setCurrentUserPicture(
                    isDefaultAvatar(data.picture) ? null : data.picture,
                );
                if (data.name) {
                    setCurrentUserName(data.name);
                    localStorage.setItem("twotop-user-name", data.name);
                }
            }
        } catch (err) {
            setCurrentUserPicture(null);
        }
    };

    const updateCurrentUserName = (name) => {
        setCurrentUserName(name);
        localStorage.setItem("twotop-user-name", name);
    };

    return {
        currentUserPicture,
        setCurrentUserPicture,
        currentUserName,
        updateCurrentUserName,
        fetchCurrentUser,
    };
}
