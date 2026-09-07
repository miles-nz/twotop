import { useMemo } from "react";
import { preferences } from "../resources";

const normalize = (str) =>
    str
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() ?? "";

const getFieldAverage = (review, field) => {
    const values = [
        review[field],
        ...(review.contributions || []).map((c) => c[field]),
    ].filter((v) => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

const getOwnFieldRating = (review, field, currentUserId) => {
    if (review.user_id === currentUserId) return review[field] ?? null;
    const contribution = (review.contributions || []).find(
        (c) => c.user_id === currentUserId,
    );
    return contribution ? (contribution[field] ?? null) : null;
};

const getFieldRating = (review, field, currentUserId, useOwnRating) =>
    useOwnRating
        ? getOwnFieldRating(review, field, currentUserId)
        : getFieldAverage(review, field);

const getAverageRating = (review, currentUserId, useOwnRating) => {
    const fields = ["food_rating", "drink_rating", "ambience_rating"];
    const values = fields
        .map((f) => getFieldRating(review, f, currentUserId, useOwnRating))
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

const passesRatingFilters = (review, filters, currentUserId) => {
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

    const useOwnRating = filters.userFilter?.type === "mine";
    const foodRating = getFieldRating(
        review,
        "food_rating",
        currentUserId,
        useOwnRating,
    );
    const drinkRating = getFieldRating(
        review,
        "drink_rating",
        currentUserId,
        useOwnRating,
    );
    const ambienceRating = getFieldRating(
        review,
        "ambience_rating",
        currentUserId,
        useOwnRating,
    );

    let atLeastOnePass = false;

    if (foodActive) {
        if (foodRating !== null) {
            if (!passesRatingFilter(foodRating, minFoodRating, maxFoodRating))
                return false;
            atLeastOnePass = true;
        }
    }

    if (drinkActive) {
        if (drinkRating !== null) {
            if (
                !passesRatingFilter(drinkRating, minDrinkRating, maxDrinkRating)
            )
                return false;
            atLeastOnePass = true;
        }
    }

    if (ambienceActive) {
        if (ambienceRating !== null) {
            if (
                !passesRatingFilter(
                    ambienceRating,
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
        case "friends":
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
            const query = normalize(filters.search);
            result = result.filter(
                (r) =>
                    normalize(r.restaurant_name).includes(query) ||
                    normalize(r.review_text).includes(query) ||
                    (r.contributions || []).some((c) =>
                        normalize(c.review_text).includes(query),
                    ),
            );
        }

        // Rating filters
        result = result.filter((r) =>
            passesRatingFilters(r, filters, currentUserId),
        );

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
        const useOwnRatingForSort = filters.userFilter?.type === "mine";
        result.sort((a, b) => {
            switch (filters.sort) {
                case "date_asc":
                    return a.visit_date.localeCompare(b.visit_date);
                case "rating_desc":
                    return (
                        (getAverageRating(
                            b,
                            currentUserId,
                            useOwnRatingForSort,
                        ) ?? -1) -
                        (getAverageRating(
                            a,
                            currentUserId,
                            useOwnRatingForSort,
                        ) ?? -1)
                    );
                case "rating_asc":
                    return (
                        (getAverageRating(
                            a,
                            currentUserId,
                            useOwnRatingForSort,
                        ) ?? -1) -
                        (getAverageRating(
                            b,
                            currentUserId,
                            useOwnRatingForSort,
                        ) ?? -1)
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
