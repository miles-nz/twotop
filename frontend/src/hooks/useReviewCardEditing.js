import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { text, draftKeys } from "../resources";

export function useReviewCardEditing(
    review,
    onReviewUpdated,
    isEditing = false,
) {
    const { getAccessTokenSilently } = useAuth0();

    const draftKey = `${draftKeys.editReviewPrefix}${review.id}`;

    // Name editing
    const [editedName, setEditedName] = useState(review.restaurant_name);

    // Review editing
    const [editedVisitDate, setEditedVisitDate] = useState(
        review.visit_date || "",
    );
    const [editedReviewText, setEditedReviewText] = useState(
        review.review_text || "",
    );
    const [editedFoodRating, setEditedFoodRating] = useState(
        review.food_rating ?? null,
    );
    const [editedDrinkRating, setEditedDrinkRating] = useState(
        review.drink_rating ?? null,
    );
    const [editedAmbienceRating, setEditedAmbienceRating] = useState(
        review.ambience_rating ?? null,
    );
    const [editedFoodEmoji, setEditedFoodEmoji] = useState(
        review.food_emoji || text.defaultFoodEmoji,
    );
    const [editedDrinkEmoji, setEditedDrinkEmoji] = useState(
        review.drink_emoji || text.defaultDrinkEmoji,
    );
    const [editedAmbienceEmoji, setEditedAmbienceEmoji] = useState(
        review.ambience_emoji || text.defaultAmbienceEmoji,
    );

    const [saveError, setSaveError] = useState(null);

    // Photo editing
    const [addPhotoImages, setAddPhotoImages] = useState([]);
    const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);

    const [saving, setSaving] = useState(false);
    const [draftWasRestored, setDraftWasRestored] = useState(false);

    // Restore draft only when edit mode opens
    useEffect(() => {
        if (!isEditing) {
            setDraftWasRestored(false);
            return;
        }
        try {
            const saved = localStorage.getItem(draftKey);
            if (!saved) return;
            const draft = JSON.parse(saved);
            const hasChanges =
                (draft.reviewText &&
                    draft.reviewText !== (review.review_text || "")) ||
                (draft.visitDate &&
                    draft.visitDate !== (review.visit_date || "")) ||
                (draft.foodRating &&
                    draft.foodRating !== (review.food_rating ?? null)) ||
                (draft.drinkRating &&
                    draft.drinkRating !== (review.drink_rating ?? null)) ||
                (draft.ambienceRating &&
                    draft.ambienceRating !== (review.ambience_rating ?? null));
            if (!hasChanges) return;
            if (draft.visitDate) setEditedVisitDate(draft.visitDate);
            if (draft.reviewText) setEditedReviewText(draft.reviewText);
            if (draft.foodRating) setEditedFoodRating(draft.foodRating);
            if (draft.drinkRating) setEditedDrinkRating(draft.drinkRating);
            if (draft.ambienceRating)
                setEditedAmbienceRating(draft.ambienceRating);
            if (draft.foodEmoji) setEditedFoodEmoji(draft.foodEmoji);
            if (draft.drinkEmoji) setEditedDrinkEmoji(draft.drinkEmoji);
            if (draft.ambienceEmoji)
                setEditedAmbienceEmoji(draft.ambienceEmoji);
            setDraftWasRestored(true);
        } catch {
            localStorage.removeItem(draftKey);
        }
    }, [isEditing, draftKey]);

    // Save draft whenever fields change, but only when editing
    useEffect(() => {
        if (!isEditing) return;
        try {
            const draft = {
                visitDate: editedVisitDate,
                reviewText: editedReviewText,
                foodRating: editedFoodRating,
                drinkRating: editedDrinkRating,
                ambienceRating: editedAmbienceRating,
                foodEmoji: editedFoodEmoji,
                drinkEmoji: editedDrinkEmoji,
                ambienceEmoji: editedAmbienceEmoji,
            };
            const hasChanges =
                draft.reviewText !== (review.review_text || "") ||
                draft.visitDate !== (review.visit_date || "") ||
                draft.foodRating !== (review.food_rating ?? null) ||
                draft.drinkRating !== (review.drink_rating ?? null) ||
                draft.ambienceRating !== (review.ambience_rating ?? null);
            if (!hasChanges) return;
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch {}
    }, [
        isEditing,
        draftKey,
        editedVisitDate,
        editedReviewText,
        editedFoodRating,
        editedDrinkRating,
        editedAmbienceRating,
        editedFoodEmoji,
        editedDrinkEmoji,
        editedAmbienceEmoji,
        review.review_text,
        review.visit_date,
        review.food_rating,
        review.drink_rating,
        review.ambience_rating,
    ]);

    const clearDraft = () => localStorage.removeItem(draftKey);

    const resetToSaved = () => {
        setEditedName(review.restaurant_name);
        setEditedVisitDate(review.visit_date || "");
        setEditedReviewText(review.review_text || "");
        setEditedFoodRating(review.food_rating ?? null);
        setEditedDrinkRating(review.drink_rating ?? null);
        setEditedAmbienceRating(review.ambience_rating ?? null);
        setEditedFoodEmoji(review.food_emoji || text.defaultFoodEmoji);
        setEditedDrinkEmoji(review.drink_emoji || text.defaultDrinkEmoji);
        setEditedAmbienceEmoji(
            review.ambience_emoji || text.defaultAmbienceEmoji,
        );
        setAddPhotoImages([]);
        setRemovedPhotoUrls([]);
        clearDraft();
    };

    const patchReview = async (formData) => {
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            if (!response.ok) throw new Error("Failed to update");
            onReviewUpdated(review.id);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveReview = async (isPublic) => {
        setSaveError(null);
        try {
            const formData = new FormData();
            formData.append("restaurant_name", editedName);
            formData.append("review_text", editedReviewText);
            formData.append("food_rating", editedFoodRating || "");
            formData.append("drink_rating", editedDrinkRating || "");
            formData.append("ambience_rating", editedAmbienceRating || "");
            formData.append("visit_date", editedVisitDate);
            formData.append("food_emoji", editedFoodEmoji);
            formData.append("drink_emoji", editedDrinkEmoji);
            formData.append("ambience_emoji", editedAmbienceEmoji);
            if (typeof isPublic === "boolean") {
                formData.append("is_public", isPublic);
            }
            const updatedUrls = (review.image_urls || []).filter(
                (url) => !removedPhotoUrls.includes(url),
            );
            formData.append("image_urls", JSON.stringify(updatedUrls));
            addPhotoImages.forEach((image) => formData.append("images", image));
            await patchReview(formData);
            clearDraft();
            setAddPhotoImages([]);
            setRemovedPhotoUrls([]);
        } catch (err) {
            console.error(err);
            setSaveError(text.errorFailedSave);
        }
    };

    const handleRemoveExistingPhoto = (url) => {
        setRemovedPhotoUrls((prev) => [...prev, url]);
    };

    return {
        editedName,
        setEditedName,
        editedVisitDate,
        setEditedVisitDate,
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
        handleSaveReview,
        addPhotoImages,
        setAddPhotoImages,
        removedPhotoUrls,
        setRemovedPhotoUrls,
        handleRemoveExistingPhoto,
        saving,
        clearDraft,
        draftWasRestored,
        resetToSaved,
        saveError,
    };
}
