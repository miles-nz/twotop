import { useMemo } from "react";
import { preferences } from "../resources";

const getFieldAverage = (review, field) => {
    const values = [
        review[field],
        ...(review.contributions || []).map((c) => c[field]),
    ].filter((v) => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

const getAverageRating = (review) => {
    const fields = ["food_rating", "drink_rating", "ambience_rating"];
    const values = fields
        .map((f) => getFieldAverage(review, f))
        .filter((v) => v !== null);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

const passesRatingFilter = (reviewRating, min, max) => {
    if (min === null && max === null) return true;
    if (reviewRating === null) return false;
    if (min !== null && reviewRating < min) return false;
    if (max !== null && reviewRating > max) return false;
    return true;
};

const passesRatingFilters = (review, filters) => {
    const {
        minFoodRating,
        maxFoodRating,
        minDrinkRating,
        maxDrinkRating,
        minAmbienceRating,
        maxAmbienceRating,
    } = filters;

    const foodActive = minFoodRating !== null || maxFoodRating !== null;
    const drinkActive = minDrinkRating !== null || maxDrinkRating !== null;
    const ambienceActive =
        minAmbienceRating !== null || maxAmbienceRating !== null;

    if (!foodActive && !drinkActive && !ambienceActive) return true;

    const avgFood = getFieldAverage(review, "food_rating");
    const avgDrink = getFieldAverage(review, "drink_rating");
    const avgAmbience = getFieldAverage(review, "ambience_rating");

    let atLeastOnePass = false;

    if (foodActive) {
        if (avgFood !== null) {
            if (!passesRatingFilter(avgFood, minFoodRating, maxFoodRating))
                return false;
            atLeastOnePass = true;
        }
    }

    if (drinkActive) {
        if (avgDrink !== null) {
            if (!passesRatingFilter(avgDrink, minDrinkRating, maxDrinkRating))
                return false;
            atLeastOnePass = true;
        }
    }

    if (ambienceActive) {
        if (avgAmbience !== null) {
            if (
                !passesRatingFilter(
                    avgAmbience,
                    minAmbienceRating,
                    maxAmbienceRating,
                )
            )
                return false;
            atLeastOnePass = true;
        }
    }

    return atLeastOnePass;
};

const passesUserFilter = (review, userFilter, currentUserId) => {
    const { type, specificUsers } = userFilter;

    if (specificUsers && specificUsers.length > 0) {
        const allUserIds = [
            review.user_id,
            ...(review.contributions || []).map((c) => c.user_id),
        ];
        if (!specificUsers.some((id) => allUserIds.includes(id))) return false;
    }

    switch (type) {
        case "mine":
            return (
                review.user_id === currentUserId ||
                (review.contributions || []).some(
                    (c) => c.user_id === currentUserId,
                )
            );
        case "circle":
            return review.user_id !== currentUserId && !review.is_public;
        case "public":
            return review.is_public === true;
        case "all":
        default:
            return true;
    }
};

export function useReviewFilter(reviews, filters, currentUserId) {
    return useMemo(() => {
        if (!reviews) return [];

        let result = [...reviews];

        if (
            filters.search &&
            filters.search.length >= preferences.minSearchCharacters
        ) {
            const query = filters.search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.restaurant_name?.toLowerCase().includes(query) ||
                    r.review_text?.toLowerCase().includes(query) ||
                    (r.contributions || []).some((c) =>
                        c.review_text?.toLowerCase().includes(query),
                    ),
            );
        }

        // Rating filters
        result = result.filter((r) => passesRatingFilters(r, filters));

        // Date range
        if (filters.dateFrom) {
            result = result.filter((r) => r.visit_date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            result = result.filter((r) => r.visit_date <= filters.dateTo);
        }

        // User filter
        result = result.filter((r) =>
            passesUserFilter(r, filters.userFilter, currentUserId),
        );

        // Advanced: collaborative only
        if (filters.collaborativeOnly) {
            result = result.filter((r) => r.is_collaborative);
        }

        // Advanced: photos only
        if (filters.photosOnly) {
            result = result.filter((r) => r.image_urls?.length > 0);
        }

        // Advanced: has address only
        if (filters.hasAddressOnly) {
            result = result.filter((r) => r.place_id);
        }

        // Sort
        result.sort((a, b) => {
            switch (filters.sort) {
                case "date_asc":
                    return a.visit_date.localeCompare(b.visit_date);
                case "rating_desc":
                    return (
                        (getAverageRating(b) ?? -1) -
                        (getAverageRating(a) ?? -1)
                    );
                case "rating_asc":
                    return (
                        (getAverageRating(a) ?? -1) -
                        (getAverageRating(b) ?? -1)
                    );
                case "date_desc":
                default:
                    return b.visit_date.localeCompare(a.visit_date);
            }
        });

        return result;
    }, [reviews, filters, currentUserId]);
}

export const defaultFilters = {
    search: "",
    sort: "date_desc",
    minFoodRating: null,
    minDrinkRating: null,
    minAmbienceRating: null,
    dateFrom: null,
    dateTo: null,
    userFilter: { type: "all", specificUsers: [] },
    maxFoodRating: null,
    maxDrinkRating: null,
    maxAmbienceRating: null,
    collaborativeOnly: false,
    photosOnly: false,
    hasAddressOnly: false,
};
