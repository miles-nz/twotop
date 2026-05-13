import { useState } from "react";
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
        preferencesLoaded,
    } = useUserPreferences();

    const [reviewerPictureUpdate, setReviewerPictureUpdate] = useState(null);
    const [reviewerNameUpdate, setReviewerNameUpdate] = useState(null);
    const [reviewerThemeUpdate, setReviewerThemeUpdate] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);

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
                reviewerPictureUpdate,
                setReviewerPictureUpdate,
                reviewerNameUpdate,
                setReviewerNameUpdate,
                reviewerThemeUpdate,
                setReviewerThemeUpdate,
                showTutorial,
                setShowTutorial,
                preferencesLoaded,
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
