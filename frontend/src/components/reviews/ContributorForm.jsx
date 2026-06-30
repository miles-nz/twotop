import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ImagePlus, X } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import { RatingsFields } from "./FormComponents";
import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useUser } from "../../contexts/UserContext";
import { text } from "../../resources";

const inputClass =
    "w-full border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300";

function ContributorForm({ review, existingContribution, onSaved, onCancel }) {
    const { getAccessTokenSilently } = useAuth0();
    const { currentUserName, currentUserPicture } = useUser();

    const [foodRating, setFoodRating] = useState(
        existingContribution?.food_rating ?? null,
    );
    const [drinkRating, setDrinkRating] = useState(
        existingContribution?.drink_rating ?? null,
    );
    const [ambienceRating, setAmbienceRating] = useState(
        existingContribution?.ambience_rating ?? null,
    );
    const [reviewText, setReviewText] = useState(
        existingContribution?.review_text ?? "",
    );
    const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const textareaRef = useRef(null);
    useAutoResize(textareaRef, reviewText);

    const existingImageUrls = existingContribution?.image_urls || [];

    const currentExistingCount =
        existingImageUrls.length - removedPhotoUrls.length;

    const {
        images,
        fileInputRef,
        currentCropSrc,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        handleImageRemove,
        uploadError,
    } = useImageUpload(5, () => currentExistingCount);

    const handleRemoveExistingPhoto = (url) => {
        setRemovedPhotoUrls((prev) => [...prev, url]);
    };

    const handleSave = async () => {
        setError(null);

        const hasRating = foodRating || drinkRating || ambienceRating;
        const hasText = reviewText.trim().length > 0;

        if (!hasRating && !hasText) {
            setError(text.errorMissingRequiredFields);
            return;
        }

        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("reviewer_name", currentUserName || "");
            formData.append("reviewer_picture", currentUserPicture || "");
            formData.append("review_text", reviewText);
            formData.append("food_rating", foodRating ?? "");
            formData.append("drink_rating", drinkRating ?? "");
            formData.append("ambience_rating", ambienceRating ?? "");

            const keptUrls = existingImageUrls.filter(
                (url) => !removedPhotoUrls.includes(url),
            );
            formData.append("image_urls", JSON.stringify(keptUrls));
            images.forEach((image) => formData.append("images", image));

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}/contributions`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || text.errorGeneric);
            onSaved(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const totalPhotoCount = currentExistingCount + images.length;

    return (
        <div className="px-6 py-4">
            <p className="text-sm font-medium text-text-dark mb-3">
                {text.contributionFormHeading}
            </p>
            <div className="border-t border-surface-200 mb-3 -mx-6" />
            {/* Ratings */}
            <div className="mb-4">
                <RatingsFields
                    foodRating={foodRating}
                    setFoodRating={setFoodRating}
                    drinkRating={drinkRating}
                    setDrinkRating={setDrinkRating}
                    ambienceRating={ambienceRating}
                    setAmbienceRating={setAmbienceRating}
                />
            </div>
            {/* Notes */}
            <div className="mb-4">
                <div className={`${inputClass} relative`}>
                    <textarea
                        ref={textareaRef}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={2000}
                        className="w-full overflow-hidden placeholder-text-light bg-transparent focus:outline-none min-h-24 resize-none"
                        placeholder={text.reviewNotesPlaceholder}
                    />
                </div>
            </div>
            {/* Photos */}
            <div className="mb-4">
                <div className="rounded-lg px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                        {existingImageUrls
                            .filter((url) => !removedPhotoUrls.includes(url))
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
                        {images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(image)}
                                    className="w-12 h-12 object-cover rounded-lg"
                                    alt=""
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-surface-300 hover:bg-surface-400 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {totalPhotoCount < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className={`flex items-center gap-2 text-sm text-text-light hover:text-text-mid transition-colors ${totalPhotoCount === 0 ? "w-full justify-center" : ""}`}
                            >
                                <ImagePlus size={28} />
                                {totalPhotoCount === 0 && (
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
            {error && <p className="text-error-600 text-sm mb-4">{error}</p>}
            <div className="border-t border-surface-200 pt-3 mt-1 flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="secondary"
                >
                    {saving ? text.submitting : text.save}
                </Button>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-sm text-text-light hover:text-text-mid transition-colors"
                    >
                        {text.cancel}
                    </button>
                )}
            </div>
            <LoadingOverlay isVisible={saving} />
        </div>
    );
}

export default ContributorForm;
