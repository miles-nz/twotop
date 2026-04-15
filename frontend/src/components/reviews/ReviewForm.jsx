import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import ImageCropModal from "../cards/ImageCropModal";
import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import MarkdownToolbar from "../ui/MarkdownToolbar";
import PlacesSearch from "../ui/PlacesSearch";
import RatingField from "../ui/RatingField";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useReviewDraft } from "../../hooks/useReviewDraft";
import { useUser } from "../../contexts/UserContext";

import { text, draftKeys } from "../../resources";
import { getLocalDate } from "../../utils";

const DRAFT_KEY = draftKeys.newReview;

const inputClass =
    "w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400";

function ReviewForm({ onReviewSubmitted }) {
    const { getAccessTokenSilently, user } = useAuth0();

    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [visitDate, setvisitDate] = useState("");
    const [foodRating, setFoodRating] = useState(null);
    const [drinkRating, setDrinkRating] = useState(null);
    const [ambienceRating, setAmbienceRating] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const [draftRestored, setDraftRestored] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (!saved) return false;
            const draft = JSON.parse(saved);
            return !!(
                draft.restaurantName ||
                draft.restaurantAddress ||
                draft.reviewText ||
                draft.foodRating ||
                draft.drinkRating ||
                draft.ambienceRating
            );
        } catch {
            return false;
        }
    });
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const textareaRef = useRef(null);

    useAutoResize(textareaRef, reviewText);

    const {
        images,
        fileInputRef,
        currentCropSrc,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        handleImageRemove,
        resetImages,
        uploadError,
    } = useImageUpload();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isDesktop = useBreakpoint();
    const { currentUserName, currentUserPicture } = useUser();

    const { clearDraft } = useReviewDraft({
        draftKey: DRAFT_KEY,
        restaurantName,
        restaurantAddress,
        selectedPlaceId,
        visitDate,
        reviewText,
        foodRating,
        drinkRating,
        ambienceRating,
        isPublic,
        setRestaurantName,
        setRestaurantAddress,
        setSelectedPlaceId,
        setvisitDate,
        setReviewText,
        setFoodRating,
        setDrinkRating,
        setAmbienceRating,
        setIsPublic,
    });

    const resetForm = () => {
        setRestaurantName("");
        setRestaurantAddress("");
        setSelectedPlaceId(null);
        setReviewText("");
        setFoodRating(null);
        setDrinkRating(null);
        setAmbienceRating(null);
        setvisitDate("");
        setIsPublic(false);
        resetImages();
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("restaurant_name", restaurantName);
            formData.append("restaurant_address", restaurantAddress);
            formData.append("place_id", selectedPlaceId || "");
            formData.append("review_text", reviewText);
            formData.append(
                "food_rating",
                foodRating ? parseFloat(foodRating) : "",
            );
            formData.append(
                "drink_rating",
                drinkRating ? parseFloat(drinkRating) : "",
            );
            formData.append(
                "ambience_rating",
                ambienceRating ? parseFloat(ambienceRating) : "",
            );
            formData.append("visit_date", visitDate || getLocalDate());
            formData.append("reviewer_name", currentUserName || "");
            formData.append("reviewer_picture", currentUserPicture || "");
            formData.append("is_public", isPublic);
            images.forEach((image) => formData.append("images", image));

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.errors || data.error || text.errorFailedSubmit);
                return;
            }

            clearDraft();
            resetForm();
            setDraftRestored(false);
            onReviewSubmitted(data.id);
        } catch (err) {
            setError(err.message || text.errorGeneric);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlaceSelected = (name, address, place_id) => {
        setRestaurantName(name);
        setRestaurantAddress(address);
        setSelectedPlaceId(place_id);
    };

    const handleClearPlace = () => {
        setSelectedPlaceId(null);
        setRestaurantAddress("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-200 rounded-2xl shadow-md p-6 mb-6 border border-surface-200 text-text-dark"
        >
            <h2 className="text-xl font-bold text-text-mid dark:text-text-light mb-4">
                {text.writeReview}
            </h2>

            {draftRestored && (
                <div className="flex items-center justify-between bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 mb-4 text-sm text-secondary-600">
                    <span>{text.draftRestored}</span>
                    <button
                        onClick={() => setDraftRestored(false)}
                        className="text-secondary-400 hover:text-secondary-600"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    {text.restaurantNameLabel}
                </label>
                <PlacesSearch
                    value={restaurantName}
                    onChange={setRestaurantName}
                    onPlaceSelected={handlePlaceSelected}
                    onClearPlace={handleClearPlace}
                    selectedPlaceId={selectedPlaceId}
                    className={`${inputClass} placeholder-text-light`}
                />
            </div>

            <div className="mb-4">
                <label
                    htmlFor="restaurantAddress"
                    className="block text-sm font-medium text-text-mid mb-1"
                >
                    {text.restaurantAddressLabel}
                </label>
                <input
                    id="restaurantAddress"
                    type="text"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    className={`${inputClass} placeholder-text-light`}
                    placeholder={text.restaurantAddressPlaceholder}
                />
            </div>

            <div className="mb-4 pr-6.5 md:pr-0">
                <label
                    htmlFor="visitDate"
                    className="block text-sm font-medium text-text-mid mb-1"
                >
                    {text.dateVisitedLabel}
                </label>
                <input
                    id="visitDate"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setvisitDate(e.target.value)}
                    max={getLocalDate()}
                    className={inputClass}
                    style={{
                        color: visitDate
                            ? "var(--color-text-dark)"
                            : "var(--color-text-mid)",
                        opacity: 1,
                    }}
                    aria-label={text.dateVisitedLabel}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-2">
                    {text.ratingsLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RatingField
                        label={<span>{text.foodLabel}</span>}
                        value={foodRating}
                        onChange={setFoodRating}
                        size={isDesktop ? "sm" : "md"}
                    />
                    <RatingField
                        label={<span>{text.drinksLabel}</span>}
                        value={drinkRating}
                        onChange={setDrinkRating}
                        size={isDesktop ? "sm" : "md"}
                    />
                    <RatingField
                        label={<span>{text.ambienceLabel}</span>}
                        value={ambienceRating}
                        onChange={setAmbienceRating}
                        size={isDesktop ? "sm" : "md"}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label
                    htmlFor="reviewNotes"
                    className="block text-sm font-medium text-text-mid mb-1"
                >
                    {text.reviewNotesLabel}
                </label>
                <MarkdownToolbar
                    textareaRef={textareaRef}
                    value={reviewText}
                    onChange={setReviewText}
                />
                <div className={`${inputClass} relative`}>
                    <textarea
                        id="reviewNotes"
                        ref={textareaRef}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={2000}
                        className="w-full overflow-hidden placeholder-text-light bg-transparent focus:outline-none pb-10 min-h-24 resize-none"
                        placeholder={text.reviewNotesPlaceholder}
                        aria-label={text.reviewNotesLabel}
                    />
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <div className="absolute bottom-1 right-1 flex items-center gap-1 p-2">
                        <div className="flex gap-1">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        className="w-6 h-6 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(index)}
                                        className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-3 h-3 flex items-center justify-center cursor-pointer"
                                    >
                                        <X size={8} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {images.length < 5 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    fileInputRef.current.click();
                                }}
                                className="text-secondary-400 hover:text-secondary-600 cursor-pointer transition-colors"
                            >
                                <ImagePlus size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between bg-surface-100 rounded-lg px-4 py-3 border border-surface-200">
                <label
                    htmlFor="publicToggle"
                    className="text-sm font-medium text-text-dark cursor-pointer"
                >
                    {text.markAsPublic}
                </label>
                <button
                    id="publicToggle"
                    aria-pressed={isPublic}
                    aria-label={text.markAsPublic}
                    onClick={() => setIsPublic((prev) => !prev)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                        isPublic ? "bg-secondary-500" : "bg-surface-300"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            isPublic ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            {(error || uploadError) && (
                <div className="bg-error-50 border border-error-200 rounded-2xl shadow-md p-6 mb-4">
                    {Array.isArray(error || uploadError) ? (
                        (error || uploadError).map((err, index) => (
                            <p key={index} className="text-error-600 text-sm">
                                {err}
                            </p>
                        ))
                    ) : (
                        <p className="text-error-600 text-sm">
                            {error || uploadError}
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="secondary"
                >
                    {submitting ? text.submitting : text.submitReview}
                </Button>
                {showClearConfirm ? (
                    <div className="flex items-center gap-2 text-sm text-text-light">
                        <span>{text.clearDraftConfirm}</span>
                        <button
                            onClick={() => {
                                clearDraft();
                                resetForm();
                                setDraftRestored(false);
                                setShowClearConfirm(false);
                            }}
                            className="text-error-500 hover:text-error-600 font-medium"
                        >
                            {text.yes}
                        </button>
                        <button
                            onClick={() => setShowClearConfirm(false)}
                            className="text-text-light hover:text-text-mid"
                        >
                            {text.no}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs text-text-light hover:text-text-mid transition-colors"
                    >
                        {text.clearDraft}
                    </button>
                )}
            </div>

            <LoadingOverlay isVisible={submitting} />
            {currentCropSrc && (
                <ImageCropModal
                    imageSrc={currentCropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </motion.div>
    );
}

export default ReviewForm;
