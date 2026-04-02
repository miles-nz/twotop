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

    const [editedName, setEditedName] = useState(review.restaurant_name);
    const [editedAddress, setEditedAddress] = useState(
        review.restaurant_address || "",
    );
    const [editedPlaceId, setEditedPlaceId] = useState(review.place_id || null);
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
                (draft.restaurantAddress &&
                    draft.restaurantAddress !==
                        (review.restaurant_address || "")) ||
                (draft.selectedPlaceId &&
                    draft.selectedPlaceId !== (review.place_id || null)) ||
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
            if (draft.restaurantName) setEditedName(draft.restaurantName);
            if (draft.restaurantAddress)
                setEditedAddress(draft.restaurantAddress);
            if (draft.selectedPlaceId) setEditedPlaceId(draft.selectedPlaceId);
            if (draft.visitDate) setEditedVisitDate(draft.visitDate);
            if (draft.reviewText) setEditedReviewText(draft.reviewText);
            if (draft.foodRating) setEditedFoodRating(draft.foodRating);
            if (draft.drinkRating) setEditedDrinkRating(draft.drinkRating);
            if (draft.ambienceRating)
                setEditedAmbienceRating(draft.ambienceRating);
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
                restaurantAddress: editedAddress,
                selectedPlaceId: editedPlaceId,
            };
            const hasChanges =
                draft.reviewText !== (review.review_text || "") ||
                draft.visitDate !== (review.visit_date || "") ||
                draft.foodRating !== (review.food_rating ?? null) ||
                draft.drinkRating !== (review.drink_rating ?? null) ||
                draft.ambienceRating !== (review.ambience_rating ?? null) ||
                draft.restaurantAddress !== (review.restaurant_address || "") ||
                draft.selectedPlaceId !== (review.place_id || null);
            if (!hasChanges) return;
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch {}
    }, [
        isEditing,
        draftKey,
        editedAddress,
        editedPlaceId,
        editedVisitDate,
        editedReviewText,
        editedFoodRating,
        editedDrinkRating,
        editedAmbienceRating,
        review.restaurant_address,
        review.place_id,
        review.review_text,
        review.visit_date,
        review.food_rating,
        review.drink_rating,
        review.ambience_rating,
    ]);

    const clearDraft = () => localStorage.removeItem(draftKey);

    const handlePlaceSelected = (name, address, place_id) => {
        setEditedName(name);
        setEditedAddress(address);
        setEditedPlaceId(place_id);
    };

    const handleClearPlace = () => {
        setEditedPlaceId(null);
        setEditedAddress("");
    };

    const resetToSaved = () => {
        setEditedName(review.restaurant_name);
        setEditedAddress(review.restaurant_address || "");
        setEditedPlaceId(review.place_id || null);
        setEditedVisitDate(review.visit_date || "");
        setEditedReviewText(review.review_text || "");
        setEditedFoodRating(review.food_rating ?? null);
        setEditedDrinkRating(review.drink_rating ?? null);
        setEditedAmbienceRating(review.ambience_rating ?? null);
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
            formData.append("restaurant_address", editedAddress);
            formData.append("place_id", editedPlaceId || "");
            formData.append("review_text", editedReviewText);
            formData.append("food_rating", editedFoodRating || "");
            formData.append("drink_rating", editedDrinkRating || "");
            formData.append("ambience_rating", editedAmbienceRating || "");
            formData.append("visit_date", editedVisitDate);
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
        editedAddress,
        setEditedAddress,
        editedPlaceId,
        setEditedPlaceId,
        handlePlaceSelected,
        handleClearPlace,
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
