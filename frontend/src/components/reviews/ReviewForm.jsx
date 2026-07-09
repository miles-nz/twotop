import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ImagePlus, X } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import CollaboratorCircle from "./CollaboratorCircle";
import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import PlacesSearch from "../ui/PlacesSearch";
import Checkbox from "../ui/Checkbox";
import DateSelect from "../ui/DateSelect";
import { FormError, RatingsFields } from "./FormComponents";
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
    "w-full border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300";

function ReviewForm({ onReviewSubmitted, onCropOpenChange }) {
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

    useEffect(() => {
        onCropOpenChange?.(!!currentCropSrc);
    }, [onCropOpenChange, currentCropSrc]);

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
            formData.append(
                "is_collaborative",
                selectedContributors.length > 0,
            );
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
                setError(
                    `${data.errors || data.error || text.errorFailedSubmit} (${response.status})`,
                );
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
        <div className="text-text-dark">
            {/* Draft restored banner */}
            {draftRestored && (
                <div className="flex items-center justify-between bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 mb-4 text-sm text-text-mid">
                    <span>{text.draftRestored}</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                clearDraft();
                                resetForm();
                                setDraftRestored(false);
                            }}
                            className="text-xs text-error-500 hover:text-error-600 font-medium transition-colors"
                        >
                            {text.clearDraft}
                        </button>
                        <button
                            onClick={() => setDraftRestored(false)}
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
                        value={restaurantName}
                        onChange={setRestaurantName}
                        onPlaceSelected={handlePlaceSelected}
                        onClearPlace={handleClearPlace}
                        selectedPlaceId={selectedPlaceId}
                        className="w-full border border-surface-200 rounded-lg px-3 py-3 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300 text-base placeholder-text-light"
                        showTypingPlaceholder={false}
                    />
                </div>
                <CollaboratorCircle
                    sharedWith={sharedWith}
                    selectedContributors={selectedContributors}
                    onToggle={toggleContributor}
                />
            </div>

            {/* Address + Date */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                {restaurantName &&
                    (selectedPlaceId && restaurantAddress && !editingAddress ? (
                        <button
                            type="button"
                            onClick={() => {
                                addressFocusRef.current = true;
                                setEditingAddress(true);
                            }}
                            className="flex-1 min-w-0 text-left text-sm text-text-light bg-surface-100 rounded-lg px-3 py-2 hover:bg-surface-200/50 hover:text-text-mid transition-colors truncate"
                        >
                            {restaurantAddress}
                        </button>
                    ) : !selectedPlaceId && !editingAddress ? (
                        <button
                            type="button"
                            onClick={() => {
                                addressFocusRef.current = true;
                                setEditingAddress(true);
                            }}
                            className="flex-1 text-left text-sm text-text-light bg-surface-100 rounded-lg px-3 py-2 hover:bg-surface-200/50 hover:text-text-mid transition-colors"
                        >
                            + {text.restaurantAddressLabel}
                        </button>
                    ) : (
                        <input
                            id="restaurantAddress"
                            type="text"
                            value={restaurantAddress}
                            onChange={(e) =>
                                setRestaurantAddress(e.target.value)
                            }
                            className="flex-1 border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300 placeholder-text-light text-sm"
                            placeholder={text.restaurantAddressPlaceholder}
                            autoFocus={false}
                            onBlur={() => setEditingAddress(false)}
                            ref={(el) => {
                                if (el && addressFocusRef.current) {
                                    el.focus();
                                    addressFocusRef.current = false;
                                }
                            }}
                        />
                    ))}
                <DateSelect
                    value={visitDate}
                    onChange={setVisitDate}
                    max={getLocalDate()}
                />
            </div>

            {/* Ratings */}
            <div className="mb-4">
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

            {/* Notes */}
            <div className="mb-4">
                <div className={`${inputClass} relative`}>
                    <textarea
                        id="reviewNotes"
                        ref={textareaRef}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={2000}
                        className="w-full overflow-hidden placeholder-text-light bg-transparent focus:outline-none min-h-24 resize-none"
                        placeholder={text.reviewNotesPlaceholder}
                        aria-label={text.reviewNotesLabel}
                    />
                </div>
            </div>

            {/* Photos */}
            <div className="mb-4">
                <div className="bg-transparent border border-surface-200 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
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
                        {images.length < 5 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    fileInputRef.current.click();
                                }}
                                className={`flex items-center gap-2 text-sm text-text-light hover:text-text-mid transition-colors ${images.length === 0 ? "w-full justify-center" : ""}`}
                            >
                                <ImagePlus size={28} />
                                {images.length === 0 && (
                                    <span>{text.addPhotos}</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                />
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

            <FormError error={error || uploadError} />

            <div className="flex items-center justify-between">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="secondary"
                >
                    {submitting ? text.submitting : text.submit}
                </Button>
            </div>

            <LoadingOverlay isVisible={submitting} />
            {currentCropSrc && (
                <ImageCropModal
                    imageSrc={currentCropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}

export default ReviewForm;
