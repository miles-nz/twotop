import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { text } from "../resources";

export function useReviewCardEditing(review, onReviewUpdated) {
    const { getAccessTokenSilently } = useAuth0();

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
        review.food_rating || null,
    );
    const [editedDrinkRating, setEditedDrinkRating] = useState(
        review.drink_rating || null,
    );
    const [editedAmbienceRating, setEditedAmbienceRating] = useState(
        review.ambience_rating || null,
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

    // Photo editing
    const [addPhotoImages, setAddPhotoImages] = useState([]);
    const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]);

    const [saving, setSaving] = useState(false);

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

    const handleSaveName = async () => {
        try {
            const formData = new FormData();
            formData.append("restaurant_name", editedName);
            await patchReview(formData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveReview = async () => {
        try {
            const formData = new FormData();
            formData.append("review_text", editedReviewText);
            formData.append("food_rating", editedFoodRating || "");
            formData.append("drink_rating", editedDrinkRating || "");
            formData.append("ambience_rating", editedAmbienceRating || "");
            formData.append("visit_date", editedVisitDate);
            formData.append("food_emoji", editedFoodEmoji);
            formData.append("drink_emoji", editedDrinkEmoji);
            formData.append("ambience_emoji", editedAmbienceEmoji);
            await patchReview(formData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveExistingPhoto = (url) => {
        setRemovedPhotoUrls((prev) => [...prev, url]);
    };

    const handleSavePhotos = async () => {
        try {
            const formData = new FormData();
            const updatedUrls = (review.image_urls || []).filter(
                (url) => !removedPhotoUrls.includes(url),
            );
            formData.append("image_urls", JSON.stringify(updatedUrls));
            addPhotoImages.forEach((image) => formData.append("images", image));
            await patchReview(formData);
            setAddPhotoImages([]);
            setRemovedPhotoUrls([]);
        } catch (err) {
            console.error(err);
        }
    };

    return {
        editedName,
        setEditedName,
        handleSaveName,
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
        handleSavePhotos,
        saving,
    };
}
