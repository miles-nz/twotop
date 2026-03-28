import { useEffect, useRef } from "react";
import { text, draftKeys } from "../resources";

export function useReviewDraft({
    draftKey = draftKeys.newReview,
    restaurantName,
    visitDate,
    reviewText,
    foodRating,
    drinkRating,
    ambienceRating,
    foodEmoji,
    drinkEmoji,
    ambienceEmoji,
    isPublic,
    setRestaurantName,
    setvisitDate,
    setReviewText,
    setFoodRating,
    setDrinkRating,
    setAmbienceRating,
    setFoodEmoji,
    setDrinkEmoji,
    setAmbienceEmoji,
    setIsPublic,
}) {
    // Restore draft on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(draftKey);
            if (!saved) return;
            const draft = JSON.parse(saved);
            if (draft.restaurantName) setRestaurantName?.(draft.restaurantName);
            if (draft.visitDate) setvisitDate?.(draft.visitDate);
            if (draft.reviewText) setReviewText?.(draft.reviewText);
            if (draft.foodRating) setFoodRating?.(draft.foodRating);
            if (draft.drinkRating) setDrinkRating?.(draft.drinkRating);
            if (draft.ambienceRating) setAmbienceRating?.(draft.ambienceRating);
            if (draft.foodEmoji) setFoodEmoji?.(draft.foodEmoji);
            if (draft.drinkEmoji) setDrinkEmoji?.(draft.drinkEmoji);
            if (draft.ambienceEmoji) setAmbienceEmoji?.(draft.ambienceEmoji);
            if (draft.isPublic !== undefined) setIsPublic?.(draft.isPublic);
        } catch {
            localStorage.removeItem(draftKey);
        }
    }, []);

    // Save draft on every change
    useEffect(() => {
        try {
            const draft = {
                restaurantName,
                visitDate,
                reviewText,
                foodRating,
                drinkRating,
                ambienceRating,
                foodEmoji,
                drinkEmoji,
                ambienceEmoji,
                isPublic,
            };
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch {
            // localStorage unavailable - fail silently
        }
    }, [
        draftKey,
        restaurantName,
        visitDate,
        reviewText,
        foodRating,
        drinkRating,
        ambienceRating,
        foodEmoji,
        drinkEmoji,
        ambienceEmoji,
        isPublic,
    ]);

    const clearDraft = () => localStorage.removeItem(draftKey);

    const hasDraft = () => {
        try {
            const saved = localStorage.getItem(draftKey);
            if (!saved) return false;
            const draft = JSON.parse(saved);
            return !!(
                draft.restaurantName ||
                draft.reviewText ||
                draft.foodRating ||
                draft.drinkRating ||
                draft.ambienceRating
            );
        } catch {
            return false;
        }
    };

    return { clearDraft, hasDraft };
}
