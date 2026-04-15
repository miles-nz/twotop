import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../ui/Avatar";
import ImageCropModal from "../cards/ImageCropModal";
import { text, enums } from "../../resources";
import { isDefaultAvatar } from "../../utils";
import InlineEdit from "../ui/InlineEdit";
import LoadingOverlay from "../ui/LoadingOverlay";
import SharedWithModal from "../ui/SharedWithModal";
import ThemeModal from "../ui/ThemeModal";
import DarkModeToggle from "./DarkModeToggle";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";

export default function AvatarDropdown({
    user,
    onLogout,
    showName = false,
    buttonClassName = "",
    dropdownClassName = "",
    onPictureUpdated,
    onNameUpdated,
    mobile = false,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const {
        currentThemeId,
        handleThemeChange,
        handleThemePreview,
        isDarkMode,
        toggleDarkMode,
    } = useTheme();
    const {
        currentUserName,
        updateCurrentUserName,
        currentUserPicture,
        setCurrentUserPicture,
        sharedWith,
        handleSharedWithChange,
    } = useUser();

    console.log(currentUserName);

    const [open, setOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [sharedWithModalOpen, setSharedWithModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropSrc(url);
        e.target.value = "";
    };

    const handleUpload = async (file) => {
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
            onPictureUpdated?.(data.picture);
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to upload profile picture:", err);
        } finally {
            setUploading(false);
            setCropSrc(null);
            setOpen(false);
        }
    };

    const handleCropConfirm = (croppedFile) => {
        handleUpload(croppedFile);
    };

    const handleCropCancel = () => {
        setCropSrc(null);
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
            onPictureUpdated?.(null);
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to delete profile picture:", err);
        } finally {
            setUploading(false);
            setOpen(false);
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
            onNameUpdated?.(newName);
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to update name:", err);
        } finally {
            setSavingName(false);
        }
    };

    return (
        <div className={`relative ${mobile ? "p-1.5" : ""}`} ref={dropdownRef}>
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${buttonClassName}`}
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
                        className={`absolute right-0 mt-2 w-40 bg-surface-50 border border-surface-200 rounded-lg shadow-lg overflow-hidden z-50 ${dropdownClassName}`}
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
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 14 14"
                                        fill="currentColor"
                                        className="mx-4"
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
                                    isDarkMode={isDarkMode}
                                    onToggle={toggleDarkMode}
                                />
                            </div>
                        </div>
                        {showName && (
                            <div className="w-full px-4 py-2 hover:bg-surface-100 transition-colors text-left">
                                <InlineEdit
                                    value={displayName || ""}
                                    onSave={handleSaveName}
                                    className="text-sm text-text-dark w-full truncate"
                                    inputClassName="text-sm text-text-dark w-full"
                                    displayMode={
                                        mobile
                                            ? enums.inlineEditDisplayMode
                                                  .valueWithPencil
                                            : enums.inlineEditDisplayMode
                                                  .editWithValueName
                                    }
                                    valueName="name"
                                    hoverEffects={false}
                                    showConfirmButton={mobile}
                                    onSaveComplete={() => setOpen(false)}
                                />
                            </div>
                        )}
                        <button
                            onClick={() => {
                                fileInputRef.current.click();
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 transition-colors text-left"
                        >
                            {text.uploadPhoto}
                        </button>
                        {picture && (
                            <button
                                onClick={handleDeletePicture}
                                className="w-full px-4 py-2 text-sm text-error-500 hover:bg-surface-100 transition-colors text-left"
                            >
                                {text.removePhoto}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSharedWithModalOpen(true);
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 transition-colors text-left"
                        >
                            {text.editSharedWith}
                        </button>
                        <button
                            onClick={() => {
                                onLogout();
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 transition-colors text-left"
                        >
                            {text.logOut}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {cropSrc && (
                <ImageCropModal
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
            <LoadingOverlay isVisible={uploading || savingName} />
            {themeModalOpen && (
                <ThemeModal
                    currentThemeId={currentThemeId}
                    onThemeChange={(themeId) => {
                        handleThemeChange(themeId);
                        setThemeModalOpen(false);
                    }}
                    onThemePreview={handleThemePreview}
                    onClose={() => setThemeModalOpen(false)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                />
            )}
            {sharedWithModalOpen && (
                <SharedWithModal
                    sharedWith={sharedWith}
                    onSharedWithChange={handleSharedWithChange}
                    onClose={() => setSharedWithModalOpen(false)}
                    getAccessTokenSilently={getAccessTokenSilently}
                    currentUserEmail={user?.email}
                />
            )}
        </div>
    );
}
