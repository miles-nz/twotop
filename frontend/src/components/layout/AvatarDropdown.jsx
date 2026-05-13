import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { text } from "../../resources";
import { isDefaultAvatar } from "../../utils";
import FriendsModal from "./FriendsModal";
import ThemeModal from "../themes/ThemeModal";
import DarkModeToggle from "./DarkModeToggle";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";

const menuItemClasses =
    "w-full px-4 py-2 text-sm hover:bg-surface-200 transition-colors text-left";

export default function AvatarDropdown({
    user,
    onLogout,
    showName = false,
    buttonClassName = "",
    dropdownClassName = "",
    mobile = false,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    const {
        currentThemeId,
        handleThemeChange,
        handleThemePreview,
        colorMode,
        setColorMode,
    } = useTheme();
    const {
        currentUserName,
        updateCurrentUserName,
        currentUserPicture,
        setCurrentUserPicture,
        sharedWith,
        handleSharedWithChange,
        setReviewerPictureUpdate,
        setReviewerNameUpdate,
        setShowTutorial,
    } = useUser();

    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [friendsModalOpen, setFriendsModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    const picture = isDefaultAvatar(currentUserPicture)
        ? null
        : currentUserPicture;

    const displayName = currentUserName ?? user?.name;

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleUploadPicture = async (file) => {
        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("picture", file);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/picture`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setCurrentUserPicture(data.picture);
            setReviewerPictureUpdate({
                picture: data.picture,
                userId: user.sub,
            });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to upload profile picture:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePicture = async () => {
        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/picture`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw new Error("Failed to delete picture");
            setCurrentUserPicture(null);
            setReviewerPictureUpdate({ picture: null, userId: user.sub });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to delete profile picture:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveName = async (newName) => {
        setSavingName(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/name`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newName }),
                },
            );
            if (!response.ok) throw new Error("Failed to update name");
            updateCurrentUserName(newName);
            setReviewerNameUpdate({ name: newName, userId: user.sub });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to update name:", err);
        } finally {
            setSavingName(false);
        }
    };

    return (
        <div className={`relative ${mobile ? "p-1.5" : ""}`} ref={dropdownRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${buttonClassName}`}
            >
                {!mobile && showName && (
                    <span className="text-sm text-text-dark">
                        {displayName}
                    </span>
                )}
                <Avatar
                    name={displayName}
                    picture={picture}
                    loading={uploading || currentUserPicture === undefined}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-50 bg-surface-50 border border-surface-200 rounded-lg shadow-lg overflow-hidden z-50 ${dropdownClassName}`}
                    >
                        <div className="w-full px-4 py-2 transition-colors flex items-center justify-around">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setThemeModalOpen(true);
                                        setOpen(false);
                                    }}
                                    className="text-secondary-300 hover:text-text-dark transition-colors"
                                    aria-label={text.theme}
                                    title={text.theme}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 14 14"
                                        fill="currentColor"
                                        className="mx-2"
                                    >
                                        {[0, 1, 2].map((row) =>
                                            [0, 1, 2].map((col) => (
                                                <rect
                                                    key={`${row}-${col}`}
                                                    x={col * 5}
                                                    y={row * 5}
                                                    width="3.5"
                                                    height="3.5"
                                                    rx="0.5"
                                                />
                                            )),
                                        )}
                                    </svg>
                                </button>
                                <DarkModeToggle
                                    colorMode={colorMode}
                                    onColorModeChange={setColorMode}
                                    iconOnly={true}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigate("/profile");
                                setOpen(false);
                            }}
                            className={`text-text-dark ${menuItemClasses}`}
                        >
                            {text.profile}
                        </button>
                        <button
                            onClick={() => {
                                setFriendsModalOpen(true);
                                setOpen(false);
                            }}
                            className={`text-text-dark ${menuItemClasses}`}
                        >
                            {text.friendsLabel}
                        </button>
                        <button
                            onClick={() => {
                                onLogout();
                                setOpen(false);
                            }}
                            className={`text-text-dark ${menuItemClasses}`}
                        >
                            {text.logOut}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {friendsModalOpen && (
                <FriendsModal
                    sharedWith={sharedWith}
                    onSharedWithChange={handleSharedWithChange}
                    onClose={() => setFriendsModalOpen(false)}
                    getAccessTokenSilently={getAccessTokenSilently}
                    currentUserEmail={user?.email}
                />
            )}

            {themeModalOpen && (
                <ThemeModal
                    currentThemeId={currentThemeId}
                    onThemeChange={(themeId) => {
                        handleThemeChange(themeId);
                        setThemeModalOpen(false);
                    }}
                    onThemePreview={handleThemePreview}
                    onClose={() => setThemeModalOpen(false)}
                />
            )}
        </div>
    );
}
