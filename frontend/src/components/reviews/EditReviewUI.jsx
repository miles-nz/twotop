import { useRef, useState } from "react";
import { Check, X, ImagePlus } from "lucide-react";
import MarkdownToolbar from "./MarkdownToolbar";
import PlacesSearch from "../ui/PlacesSearch";
import ImageCropModal from "./ImageCropModal";
import { RatingsFields, ContributorPicker } from "./FormComponents";
import { getLocalDate } from "../../utils";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useUser } from "../../contexts/UserContext";
import Checkbox from "../ui/Checkbox";
import { text } from "../../resources";

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
        editedIsCollaborative,
        editedAllowedContributors,
        handleToggleCollaborative,
        handleRemoveContributor,
        handleAddContributor,
    } = editingState;

    const textareaRef = useRef(null);
    const [isPublic, setIsPublic] = useState(review.is_public);
    const [draftDismissed, setDraftDismissed] = useState(false);
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

            <div className="mb-4">
                <PlacesSearch
                    value={editedName}
                    onChange={setEditedName}
                    onPlaceSelected={handlePlaceSelected}
                    onClearPlace={handleClearPlace}
                    selectedPlaceId={editedPlaceId}
                    className="text-2xl font-bold text-text-dark bg-transparent border-b border-secondary-400 focus:outline-none w-full"
                />
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    placeholder={text.restaurantAddressPlaceholder}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark text-sm placeholder-text-light"
                />
            </div>

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

            <div className="mb-3 pr-6.5 md:pr-0">
                <input
                    type="date"
                    value={editedVisitDate}
                    onChange={(e) => setEditedVisitDate(e.target.value)}
                    max={getLocalDate()}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark cursor-pointer"
                />
            </div>

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
                className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 overflow-hidden text-text-dark"
            />

            <div className="border border-surface-200 rounded-xl p-4 bg-surface-50 mt-4">
                <div className="flex flex-wrap gap-2">
                    {review.image_urls &&
                        review.image_urls
                            .filter((url) => !removedPhotoUrls.includes(url))
                            .map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        alt=""
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveExistingPhoto(url)
                                        }
                                        className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center"
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
                                alt=""
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setAddPhotoImages((prev) =>
                                        prev.filter((_, i) => i !== index),
                                    )
                                }
                                className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    {currentPhotoCount < 5 && (
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
                                className="w-16 h-16 flex items-center justify-center text-secondary-400 hover:text-secondary-600 transition-colors"
                            >
                                <ImagePlus size={24} />
                            </button>
                        </>
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

            <div className="mt-4 bg-surface-100 rounded-lg border border-surface-200 px-4 py-3 flex flex-col gap-2">
                <Checkbox
                    checked={isPublic}
                    onChange={setIsPublic}
                    label={text.markAsPublic}
                />
                <Checkbox
                    checked={editedIsCollaborative}
                    onChange={handleToggleCollaborative}
                    label={text.collaborative}
                />
            </div>

            {editedIsCollaborative && (
                <div className="mt-3 bg-surface-100 rounded-lg border border-surface-200 px-4 py-3">
                    <p className="text-sm font-medium text-text-dark mb-3">
                        {text.selectContributors}
                    </p>
                    <ContributorPicker
                        sharedWith={sharedWith}
                        selectedContributors={editedAllowedContributors}
                        onToggle={(person) =>
                            editedAllowedContributors.some(
                                (c) => c.user_id === person.user_id,
                            )
                                ? handleRemoveContributor(person.user_id)
                                : handleAddContributor(person)
                        }
                    />
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={onClose}
                    className="text-text-light hover:text-text-mid transition-colors"
                >
                    <X size={18} className="sm:w-4.5 sm:h-4.5 w-6 h-6" />
                </button>
                <button
                    onClick={handleSaveWithPublic}
                    className="text-secondary-500 hover:text-secondary-600 transition-colors"
                >
                    <Check size={18} className="sm:w-4.5 sm:h-4.5 w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

export default EditReviewUI;
