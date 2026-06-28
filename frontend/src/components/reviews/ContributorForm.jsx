import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { RatingsFields } from "./FormComponents";
import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import { useAutoResize } from "../../hooks/useAutoResize";
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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const textareaRef = useRef(null);
    useAutoResize(textareaRef, reviewText);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}/contributions`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reviewer_name: currentUserName || "",
                        reviewer_picture: currentUserPicture || "",
                        review_text: reviewText,
                        food_rating: foodRating ?? null,
                        drink_rating: drinkRating ?? null,
                        ambience_rating: ambienceRating ?? null,
                    }),
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

    return (
        <div className="px-6 py-4">
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

            {error && <p className="text-error-600 text-sm mb-4">{error}</p>}

            <div className="flex items-center gap-3">
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
