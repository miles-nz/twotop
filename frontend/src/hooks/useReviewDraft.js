import { useEffect, useRef } from "react";
import { draftKeys } from "../resources";

export function useReviewDraft({
    draftKey = draftKeys.newReview,
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
}) {
    const isMounted = useRef(false);

    // Restore draft on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(draftKey);
            if (!saved) return;
            const draft = JSON.parse(saved);
            if (draft.restaurantName) setRestaurantName?.(draft.restaurantName);
            if (draft.restaurantAddress)
                setRestaurantAddress?.(draft.restaurantAddress);
            if (draft.selectedPlaceId)
                setSelectedPlaceId?.(draft.selectedPlaceId);
            if (draft.visitDate) setVisitDate?.(draft.visitDate);
            if (draft.reviewText) setReviewText?.(draft.reviewText);
            if (draft.foodRating) setFoodRating?.(draft.foodRating);
            if (draft.drinkRating) setDrinkRating?.(draft.drinkRating);
            if (draft.ambienceRating) setAmbienceRating?.(draft.ambienceRating);
            if (draft.isPublic !== undefined) setIsPublic?.(draft.isPublic);
        } catch {
            localStorage.removeItem(draftKey);
        }
    }, []);

    // Save draft on every change, skipping the first render and empty forms
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const hasContent =
            restaurantName ||
            restaurantAddress ||
            reviewText ||
            foodRating ||
            drinkRating ||
            ambienceRating;
        if (!hasContent) return;
        try {
            const draft = {
                restaurantName,
                restaurantAddress,
                selectedPlaceId,
                visitDate,
                reviewText,
                foodRating,
                drinkRating,
                ambienceRating,
                isPublic,
            };
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch {
            // localStorage unavailable - fail silently
        }
    }, [
        draftKey,
        restaurantName,
        restaurantAddress,
        selectedPlaceId,
        visitDate,
        reviewText,
        foodRating,
        drinkRating,
        ambienceRating,
        isPublic,
    ]);

    const clearDraft = () => localStorage.removeItem(draftKey);

    return { clearDraft };
}
