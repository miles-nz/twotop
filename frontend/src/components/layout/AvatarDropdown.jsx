import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../ui/Avatar";
import ImageCropModal from "../cards/ImageCropModal";
import { text } from "../../resources";
import { isDefaultAvatar } from "../../utils";

export default function AvatarDropdown({
    user,
    onLogout,
    showName = false,
    buttonClassName = "",
    dropdownClassName = "",
    currentUserPicture,
    onPictureUpdated,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const [open, setOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [uploading, setUploading] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    const picture = isDefaultAvatar(currentUserPicture)
        ? null
        : currentUserPicture;

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

        const img = new Image();
        img.onload = () => {
            if (img.width === img.height) {
                handleUpload(file);
            } else {
                setCropSrc(url);
            }
        };
        img.src = url;
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
            onPictureUpdated?.(null);
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error("Failed to delete profile picture:", err);
        } finally {
            setUploading(false);
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
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
                <Avatar
                    name={user?.name}
                    picture={picture}
                    loading={uploading}
                />
                {showName && (
                    <span className="text-sm text-text-mid">{user?.name}</span>
                )}
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
                        <button
                            onClick={() => {
                                fileInputRef.current.click();
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 transition-colors text-left"
                        >
                            {uploading ? text.uploading : text.uploadPhoto}
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
        </div>
    );
}
