import { useRef, useState } from "react";
import { Check, X, ImagePlus } from "lucide-react";
import RatingField from "../ui/RatingField";
import EmojiPicker from "../ui/EmojiPicker";
import MarkdownToolbar from "../ui/MarkdownToolbar";
import ImageCropModal from "./ImageCropModal";
import { text } from "../../resources";
import { getLocalDate } from "../../utils";
import { useImageUpload } from "../../hooks/useImageUpload";
import PublicToggle from "../layout/PublicToggle";

function EditReviewUI({ editingState, handleSave, onClose, review }) {
    const {
        editedName,
        setEditedName,
        editedReviewText,
        setEditedReviewText,
        editedFoodRating,
        setEditedFoodRating,
        editedDrinkRating,
        setEditedDrinkRating,
        editedAmbienceRating,
        setEditedAmbienceRating,
        editedFoodEmoji,
        setEditedFoodEmoji,
        editedDrinkEmoji,
        setEditedDrinkEmoji,
        editedAmbienceEmoji,
        setEditedAmbienceEmoji,
        editedVisitDate,
        setEditedVisitDate,
        addPhotoImages,
        setAddPhotoImages,
        removedPhotoUrls,
        handleRemoveExistingPhoto,
        draftWasRestored,
        resetToSaved,
        saveError,
    } = editingState;
    const textareaRef = useRef(null);
    const [draftDismissed, setDraftDismissed] = useState(false);

    const {
        fileInputRef,
        currentCropSrc,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        uploadError,
    } = useImageUpload(
        5,
        () =>
            (review.image_urls?.length || 0) -
            removedPhotoUrls.length +
            addPhotoImages.length,
        setAddPhotoImages,
    );

    const [isPublic, setIsPublic] = useState(review.is_public);

    const handleSaveWithPublic = async () => {
        await handleSave(isPublic);
        onClose();
    };

    return (
        <div className="px-6 pt-6 pb-4">
            {draftWasRestored && !draftDismissed && (
                <div className="flex items-center justify-between bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 mb-4 text-sm text-secondary-600">
                    <span>{text.draftRestored}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                resetToSaved();
                                setDraftDismissed(true);
                            }}
                            className="text-secondary-400 hover:text-secondary-600 text-xs"
                        >
                            {text.clearDraft}
                        </button>
                        <button
                            onClick={() => setDraftDismissed(true)}
                            className="text-secondary-400 hover:text-secondary-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Restaurant Name */}
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    maxLength={100}
                    className="text-2xl font-bold text-text-dark bg-transparent border-b border-secondary-400 focus:outline-none w-full"
                />
            </div>

            {/* Ratings & Emojis */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                <RatingField
                    label={
                        <span className="flex items-center justify-center gap-1">
                            <EmojiPicker
                                type="food"
                                value={editedFoodEmoji}
                                onChange={setEditedFoodEmoji}
                            />
                            {text.foodLabel}
                        </span>
                    }
                    value={editedFoodRating}
                    onChange={setEditedFoodRating}
                    size="sm"
                />
                <RatingField
                    label={
                        <span className="flex items-center justify-center gap-1">
                            <EmojiPicker
                                type="drink"
                                value={editedDrinkEmoji}
                                onChange={setEditedDrinkEmoji}
                            />
                            {text.drinksLabel}
                        </span>
                    }
                    value={editedDrinkRating}
                    onChange={setEditedDrinkRating}
                    size="sm"
                />
                <RatingField
                    label={
                        <span className="flex items-center justify-center gap-1">
                            <EmojiPicker
                                type="ambience"
                                value={editedAmbienceEmoji}
                                onChange={setEditedAmbienceEmoji}
                            />
                            {text.ambienceLabel}
                        </span>
                    }
                    value={editedAmbienceRating}
                    onChange={setEditedAmbienceRating}
                    size="sm"
                />
            </div>

            {/* Visit Date */}
            <div className="mb-3 pr-6.5 md:pr-0">
                <input
                    type="date"
                    value={editedVisitDate}
                    onChange={(e) => setEditedVisitDate(e.target.value)}
                    max={getLocalDate()}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark"
                />
            </div>

            {/* Review Text */}
            <MarkdownToolbar
                textareaRef={textareaRef}
                value={editedReviewText}
                onChange={setEditedReviewText}
            />
            <textarea
                ref={textareaRef}
                value={editedReviewText}
                onChange={(e) => setEditedReviewText(e.target.value)}
                maxLength={2000}
                className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 h-28 resize-none text-text-dark"
            />

            {/* Photos */}
            <div className="border border-surface-200 rounded-xl p-4 bg-surface-50 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 flex-1">
                        {review.image_urls &&
                            review.image_urls
                                .filter(
                                    (url) => !removedPhotoUrls.includes(url),
                                )
                                .map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExistingPhoto(url)
                                            }
                                            className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                        {addPhotoImages.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(image)}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAddPhotoImages((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {(review.image_urls?.length || 0) -
                            removedPhotoUrls.length +
                            addPhotoImages.length <
                            5 && (
                            <>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-16 h-16 flex items-center justify-center text-secondary-400 hover:text-secondary-600 cursor-pointer transition-colors"
                                >
                                    <ImagePlus size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {uploadError && (
                    <div className="mt-2">
                        {Array.isArray(uploadError) ? (
                            uploadError.map((err, index) => (
                                <p
                                    key={index}
                                    className="text-error-600 text-sm"
                                >
                                    {err}
                                </p>
                            ))
                        ) : (
                            <p className="text-error-600 text-sm">
                                {uploadError}
                            </p>
                        )}
                    </div>
                )}
                {currentCropSrc && (
                    <ImageCropModal
                        imageSrc={currentCropSrc}
                        onConfirm={handleCropConfirm}
                        onCancel={handleCropCancel}
                    />
                )}
            </div>

            {saveError && (
                <p className="text-error-600 text-sm mt-3">{saveError}</p>
            )}
            <div className="flex items-center justify-between mt-4"></div>

            {/* Actions & Public Toggle at bottom */}
            <div className="flex items-center justify-between mt-4">
                <PublicToggle isPublic={isPublic} onToggle={setIsPublic} />
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="text-text-light hover:text-text-mid cursor-pointer transition-colors"
                    >
                        <X size={18} className="sm:w-4.5 sm:h-4.5 w-6 h-6" />
                    </button>
                    <button
                        onClick={handleSaveWithPublic}
                        className="text-secondary-500 hover:text-secondary-600 cursor-pointer transition-colors"
                    >
                        <Check
                            size={18}
                            className="sm:w-4.5 sm:h-4.5 w-6 h-6"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditReviewUI;
