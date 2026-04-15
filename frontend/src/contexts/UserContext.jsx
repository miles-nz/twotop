import { createContext, useContext } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useSharedWith } from "../hooks/useSharedWith";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const {
        currentUserPicture,
        setCurrentUserPicture,
        currentUserName,
        updateCurrentUserName,
        fetchCurrentUser,
    } = useCurrentUser();

    const { sharedWith, fetchSharedWith, handleSharedWithChange } =
        useSharedWith();

    const fetchPreferences = async () => {
        await fetchSharedWith();
    };

    return (
        <UserContext.Provider
            value={{
                currentUserName,
                updateCurrentUserName,
                currentUserPicture,
                setCurrentUserPicture,
                fetchCurrentUser,
                sharedWith,
                handleSharedWithChange,
                fetchPreferences,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
}
