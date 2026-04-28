import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera } from "lucide-react";
import { text, enums } from "../../resources";
import Avatar from "../ui/Avatar";
import InlineEdit from "../ui/InlineEdit";
import ImageCropModal from "../cards/ImageCropModal";
import LoadingOverlay from "../ui/LoadingOverlay";
import { isDefaultAvatar } from "../../utils";

export default function EditProfileModal({
    user,
    currentUserName,
    currentUserPicture,
    onSaveName,
    onUploadPicture,
    onDeletePicture,
    onClose,
    uploading,
    savingName,
    onShowTutorial,
}) {
    const fileInputRef = useRef(null);
    const [cropSrc, setCropSrc] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const picture = isDefaultAvatar(currentUserPicture)
        ? null
        : currentUserPicture;

    const displayName = currentUserName ?? user?.name;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropSrc(url);
        e.target.value = "";
    };

    const handleCropConfirm = (croppedFile) => {
        onUploadPicture(croppedFile);
        setCropSrc(null);
    };

    const handleCropCancel = () => {
        setCropSrc(null);
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full max-w-sm overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                            <h2 className="text-sm font-medium text-text-dark">
                                {text.profile}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-text-light hover:text-text-dark transition-colors"
                                aria-label={text.close}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Avatar preview */}
                        <div className="flex flex-col items-center gap-4 px-5 py-6 border-b border-surface-200">
                            <div className="relative">
                                <Avatar
                                    name={displayName}
                                    picture={picture}
                                    size="xl"
                                    loading={
                                        uploading ||
                                        currentUserPicture === undefined
                                    }
                                />
                                {/* Upload button */}
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-2 left-2 p-2.5 bg-surface-50 border border-surface-200 rounded-full text-text-light hover:text-text-dark transition-colors shadow-sm"
                                    aria-label={text.uploadPhoto}
                                >
                                    <Camera size={16} />
                                </button>
                                {/* Remove button */}
                                {picture && (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="absolute top-2 right-2 p-2.5 bg-surface-50 border border-surface-200 rounded-full text-text-light hover:text-error-500 transition-colors shadow-sm"
                                        aria-label={text.removePhoto}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Confirm delete */}
                            {confirmDelete && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-text-light">
                                        {text.removePhoto}?
                                    </span>
                                    <button
                                        onClick={() => {
                                            onDeletePicture();
                                            setConfirmDelete(false);
                                        }}
                                        className="text-sm text-error-500 hover:underline"
                                    >
                                        {text.yes}
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="text-sm text-text-light hover:underline"
                                    >
                                        {text.cancel}
                                    </button>
                                </div>
                            )}

                            {/* Name edit */}
                            <div className="w-full flex justify-center">
                                <InlineEdit
                                    value={displayName || ""}
                                    onSave={onSaveName}
                                    className="text-text-dark truncate text-center"
                                    inputClassName="text-sm text-text-dark text-center"
                                    displayMode={
                                        enums.inlineEditDisplayMode
                                            .valueWithPencil
                                    }
                                    valueName="name"
                                    hoverEffects={true}
                                    showConfirmButton={true}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-surface-200 flex items-center justify-between">
                            <button
                                onClick={onShowTutorial}
                                className="text-sm text-text-light hover:text-text-dark transition-colors"
                            >
                                {text.showTutorial}
                            </button>
                            <button
                                onClick={onClose}
                                className="text-sm text-text-mid hover:text-text-dark transition-colors"
                            >
                                {text.done}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />

            {cropSrc && (
                <ImageCropModal
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <LoadingOverlay isVisible={uploading || savingName} />
        </>
    );
}
