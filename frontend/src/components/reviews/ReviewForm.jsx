import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import MarkdownToolbar from "./MarkdownToolbar";
import PlacesSearch from "../ui/PlacesSearch";
import { FormError, RatingsFields, ContributorPicker } from "./FormComponents";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useReviewDraft } from "../../hooks/useReviewDraft";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { text, draftKeys } from "../../resources";
import { getLocalDate } from "../../utils";

const DRAFT_KEY = draftKeys.newReview;

const inputClass =
    "w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400";

function ReviewForm({ onReviewSubmitted }) {
    const { getAccessTokenSilently } = useAuth0();

    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [visitDate, setVisitDate] = useState(getLocalDate());
    const [foodRating, setFoodRating] = useState(null);
    const [drinkRating, setDrinkRating] = useState(null);
    const [ambienceRating, setAmbienceRating] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isCollaborative, setIsCollaborative] = useState(false);
    const [selectedContributors, setSelectedContributors] = useState([]);
    const [editingAddress, setEditingAddress] = useState(false);

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
    const addressFocusRef = useRef(false);

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

    const isDesktop = useBreakpoint("md");
    const { currentUserName, currentUserPicture, sharedWith } = useUser();
    const { currentThemeId } = useTheme();

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
        setVisitDate,
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
        setVisitDate(getLocalDate());
        setIsPublic(false);
        setIsCollaborative(false);
        setSelectedContributors([]);
        resetImages();
        setEditingAddress(false);
    };

    const toggleContributor = (person) => {
        setSelectedContributors((prev) =>
            prev.some((c) => c.user_id === person.user_id)
                ? prev.filter((c) => c.user_id !== person.user_id)
                : [...prev, person],
        );
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
            formData.append("is_collaborative", isCollaborative);
            formData.append(
                "allowed_contributors",
                JSON.stringify(selectedContributors),
            );
            formData.append("theme_id", currentThemeId);
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
        setEditingAddress(false);
    };

    const handleClearPlace = () => {
        setSelectedPlaceId(null);
        setRestaurantAddress("");
        setEditingAddress(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-200 rounded-2xl shadow-md p-6 mb-6 border border-surface-200 text-text-dark"
        >
            <h2 className="text-xl font-bold text-text-mid dark:text-text-dark mb-4">
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
                {!restaurantName ? null : selectedPlaceId &&
                  restaurantAddress &&
                  !editingAddress ? (
                    <div className="flex items-center justify-between px-1 py-1">
                        <span className="text-sm text-text-light">
                            {restaurantAddress}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                addressFocusRef.current = true;
                                setEditingAddress(true);
                            }}
                            className="text-xs text-text-light hover:text-text-mid transition-colors ml-2 shrink-0"
                        >
                            {text.edit}
                        </button>
                    </div>
                ) : !selectedPlaceId && !editingAddress ? (
                    <button
                        type="button"
                        onClick={() => {
                            addressFocusRef.current = true;
                            setEditingAddress(true);
                        }}
                        className="text-xs text-text-light hover:text-text-mid transition-colors"
                    >
                        + {text.restaurantAddressLabel}
                    </button>
                ) : (
                    <>
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
                            onChange={(e) =>
                                setRestaurantAddress(e.target.value)
                            }
                            className={`${inputClass} placeholder-text-light`}
                            placeholder={text.restaurantAddressPlaceholder}
                            autoFocus={false}
                            ref={(el) => {
                                if (el && addressFocusRef.current) {
                                    el.focus();
                                    addressFocusRef.current = false;
                                }
                            }}
                        />
                    </>
                )}
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
                    onChange={(e) => setVisitDate(e.target.value)}
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
                <RatingsFields
                    foodRating={foodRating}
                    setFoodRating={setFoodRating}
                    drinkRating={drinkRating}
                    setDrinkRating={setDrinkRating}
                    ambienceRating={ambienceRating}
                    setAmbienceRating={setAmbienceRating}
                    size={isDesktop ? "sm" : "md"}
                />
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
                                        alt=""
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

            {/* Public + Collaborative checkboxes */}
            <div className="mb-4 bg-surface-100 rounded-lg border border-surface-200 px-4 py-3 flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 accent-secondary-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-text-dark">
                        {text.markAsPublic}
                    </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isCollaborative}
                        onChange={(e) => {
                            setIsCollaborative(e.target.checked);
                            if (!e.target.checked) setSelectedContributors([]);
                        }}
                        className="w-4 h-4 accent-secondary-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-text-dark">
                        {text.collaborative}
                    </span>
                </label>
            </div>

            {isCollaborative && (
                <div className="mb-4 bg-surface-100 rounded-lg px-4 py-3 border border-surface-200">
                    <p className="text-sm font-medium text-text-dark mb-3">
                        {text.selectContributors}
                    </p>
                    <ContributorPicker
                        sharedWith={sharedWith}
                        selectedContributors={selectedContributors}
                        onToggle={toggleContributor}
                    />
                </div>
            )}

            <FormError error={error || uploadError} />

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
