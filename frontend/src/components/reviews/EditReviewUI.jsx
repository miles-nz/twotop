import { useRef, useEffect, useState } from "react";
import { X, ImagePlus } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import CollaboratorCircle from "./CollaboratorCircle";
import LoadingOverlay from "../ui/LoadingOverlay";
import PlacesSearch from "../ui/PlacesSearch";
import DateSelect from "../ui/DateSelect";
import { RatingsFields } from "./FormComponents";
import { getLocalDate } from "../../utils";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useUser } from "../../contexts/UserContext";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";
import { text } from "../../resources";

const inputClass =
    "w-full border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300";

function EditReviewUI({ editingState, handleSave, onClose, review }) {
    const {
        editedName,
        setEditedName,
        editedAddress,
        setEditedAddress,
        editedPlaceId,
        handlePlaceSelected,
        handleClearPlace,
        editedReviewText,
        setEditedReviewText,
        editedFoodRating,
        setEditedFoodRating,
        editedDrinkRating,
        setEditedDrinkRating,
        editedAmbienceRating,
        setEditedAmbienceRating,
        editedVisitDate,
        setEditedVisitDate,
        addPhotoImages,
        setAddPhotoImages,
        removedPhotoUrls,
        handleRemoveExistingPhoto,
        draftWasRestored,
        resetToSaved,
        saveError,
        editedAllowedContributors,
        handleRemoveContributor,
        handleAddContributor,
        saving,
    } = editingState;

    const textareaRef = useRef(null);
    const [isPublic, setIsPublic] = useState(review.is_public);
    const [draftDismissed, setDraftDismissed] = useState(false);
    const [editingAddress, setEditingAddress] = useState(false);
    const { sharedWith } = useUser();

    const currentPhotoCount =
        (review.image_urls?.length || 0) -
        removedPhotoUrls.length +
        addPhotoImages.length;

    const {
        fileInputRef,
        currentCropSrc,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        uploadError,
    } = useImageUpload(5, () => currentPhotoCount, setAddPhotoImages);

    useAutoResize(textareaRef, editedReviewText);

    const toggleContributor = (person) => {
        if (
            editedAllowedContributors.some((c) => c.user_id === person.user_id)
        ) {
            handleRemoveContributor(person.user_id);
        } else {
            handleAddContributor(person);
        }
    };

    const handleSaveWithPublic = async () => {
        try {
            await handleSave(isPublic);
            onClose();
        } catch {
            // saveError is set inside the hook, stays open on failure
        }
    };

    return (
        <div className="px-6 pt-6 pb-4">
            {/* Draft restored banner */}
            {draftWasRestored && !draftDismissed && (
                <div className="flex items-center justify-between bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 mb-4 text-sm text-text-mid">
                    <span>{text.draftRestored}</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                resetToSaved();
                                setDraftDismissed(true);
                            }}
                            className="text-xs text-error-500 hover:text-error-600 font-medium transition-colors"
                        >
                            {text.clearDraft}
                        </button>
                        <button
                            onClick={() => setDraftDismissed(true)}
                            className="text-text-light hover:text-text-mid"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Restaurant + collaborator */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 mb-2">
                <div className="min-w-0">
                    <PlacesSearch
                        value={editedName}
                        onChange={setEditedName}
                        onPlaceSelected={handlePlaceSelected}
                        onClearPlace={handleClearPlace}
                        selectedPlaceId={editedPlaceId}
                        className="w-full border border-surface-200 rounded-lg px-3 py-3 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300 text-base placeholder-text-light"
                    />
                </div>
                <CollaboratorCircle
                    sharedWith={sharedWith}
                    selectedContributors={editedAllowedContributors}
                    onToggle={toggleContributor}
                />
            </div>

            {/* Address + Date */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                {editingAddress ? (
                    <input
                        type="text"
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        placeholder={text.restaurantAddressPlaceholder}
                        className="flex-1 border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300 placeholder-text-light text-sm"
                        autoFocus
                        onBlur={() => setEditingAddress(false)}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setEditingAddress(true)}
                        className="flex-1 min-w-0 text-left text-sm text-text-light bg-surface-100 rounded-lg px-3 py-2 hover:bg-surface-200/50 hover:text-text-mid transition-colors truncate"
                    >
                        {editedAddress || text.restaurantAddressPlaceholder}
                    </button>
                )}
                <DateSelect
                    value={editedVisitDate}
                    onChange={setEditedVisitDate}
                    max={getLocalDate()}
                />
            </div>

            {/* Ratings */}
            <div className="mb-4">
                <RatingsFields
                    foodRating={editedFoodRating}
                    setFoodRating={setEditedFoodRating}
                    drinkRating={editedDrinkRating}
                    setDrinkRating={setEditedDrinkRating}
                    ambienceRating={editedAmbienceRating}
                    setAmbienceRating={setEditedAmbienceRating}
                />
            </div>

            {/* Notes */}
            <div className="mb-4">
                <div className={`${inputClass} relative`}>
                    <textarea
                        ref={textareaRef}
                        value={editedReviewText}
                        onChange={(e) => setEditedReviewText(e.target.value)}
                        maxLength={2000}
                        className="w-full overflow-hidden placeholder-text-light bg-transparent focus:outline-none min-h-24 resize-none"
                        placeholder={text.reviewNotesPlaceholder}
                    />
                </div>
            </div>

            {/* Photos */}
            <div className="mb-4">
                <div className="border border-surface-200 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                        {review.image_urls &&
                            review.image_urls
                                .filter(
                                    (url) => !removedPhotoUrls.includes(url),
                                )
                                .map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            className="w-12 h-12 object-cover rounded-lg"
                                            alt=""
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExistingPhoto(url)
                                            }
                                            className="absolute -top-1.5 -right-1.5 bg-surface-300 hover:bg-surface-400 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                        {addPhotoImages.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(image)}
                                    className="w-12 h-12 object-cover rounded-lg"
                                    alt=""
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAddPhotoImages((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1.5 -right-1.5 bg-surface-300 hover:bg-surface-400 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {currentPhotoCount < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className={`flex items-center gap-2 text-sm text-text-light hover:text-text-mid transition-colors ${currentPhotoCount === 0 ? "w-full justify-center" : ""}`}
                            >
                                <ImagePlus size={28} />
                                {currentPhotoCount === 0 && (
                                    <span>{text.addPhotos}</span>
                                )}
                            </button>
                        )}
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
                </div>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                />
                {currentCropSrc && (
                    <ImageCropModal
                        imageSrc={currentCropSrc}
                        onConfirm={handleCropConfirm}
                        onCancel={handleCropCancel}
                    />
                )}
            </div>

            {/* Public toggle */}
            <div className="mb-4 bg-surface-100 rounded-lg px-4 py-3">
                <div className="flex flex-col gap-1">
                    <Checkbox
                        checked={isPublic}
                        onChange={setIsPublic}
                        label={text.markAsPublic}
                    />
                    <p className="text-xs text-text-light ml-6">
                        {text.markAsPublicHelper}
                    </p>
                </div>
            </div>

            {saveError && (
                <p className="text-error-600 text-sm mb-4">{saveError}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSaveWithPublic}
                    disabled={saving}
                    variant="secondary"
                >
                    {saving ? text.submitting : text.save}
                </Button>
                <button
                    onClick={onClose}
                    className="text-sm text-text-light hover:text-text-mid transition-colors"
                >
                    {text.cancel}
                </button>
            </div>

            <LoadingOverlay isVisible={saving} />
        </div>
    );
}

export default EditReviewUI;
