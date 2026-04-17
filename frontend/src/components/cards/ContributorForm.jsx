import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Check, X } from "lucide-react";
import { RatingsFields } from "../ui/FormComponents";
import MarkdownToolbar from "../ui/MarkdownToolbar";
import { useAutoResize } from "../../hooks/useAutoResize";
import { useUser } from "../../contexts/UserContext";
import { text } from "../../resources";

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

            <MarkdownToolbar
                textareaRef={textareaRef}
                value={reviewText}
                onChange={setReviewText}
            />
            <textarea
                ref={textareaRef}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={2000}
                className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 overflow-hidden text-text-dark placeholder-text-light"
                placeholder={text.reviewNotesPlaceholder}
            />

            {error && <p className="text-error-600 text-sm mt-2">{error}</p>}

            <div className="flex justify-end gap-2 mt-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-text-light hover:text-text-mid cursor-pointer transition-colors"
                    >
                        <X size={18} className="sm:w-4.5 sm:h-4.5 w-6 h-6" />
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-secondary-500 hover:text-secondary-600 cursor-pointer transition-colors disabled:opacity-50"
                >
                    <Check size={18} className="sm:w-4.5 sm:h-4.5 w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

export default ContributorForm;
