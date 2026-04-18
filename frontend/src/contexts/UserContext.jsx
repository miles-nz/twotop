import { createContext, useContext } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserPreferences } from "../hooks/useUserPreferences";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const {
        currentUserPicture,
        setCurrentUserPicture,
        currentUserName,
        updateCurrentUserName,
        fetchCurrentUser,
    } = useCurrentUser();

    const {
        sharedWith,
        fetchPreferences,
        handleSharedWithChange,
        hasSeenTutorial,
        markTutorialSeen,
    } = useUserPreferences();

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
                hasSeenTutorial,
                markTutorialSeen,
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
