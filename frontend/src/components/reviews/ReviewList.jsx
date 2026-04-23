import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingDots from "../ui/LoadingDots";
import { ReviewListProvider } from "../../contexts/ReviewListContext";
import ReviewCard from "../cards/ReviewCard";
import ReviewSearch from "./ReviewSearch";
import { useReviewFilter, defaultFilters } from "../../hooks/useReviewFilter";
import { text } from "../../resources";
import { useTheme } from "../../contexts/ThemeContext";

const statusCardClass =
    "bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200";

const alternateReviewers = (reviews) => {
    const result = [...reviews];
    for (let i = 1; i < result.length; i++) {
        if (result[i].user_id === result[i - 1].user_id) {
            const swapIndex = result.findIndex(
                (r, idx) =>
                    idx > i &&
                    r.user_id !== result[i].user_id &&
                    r.visit_date === result[i].visit_date,
            );
            if (swapIndex !== -1) {
                [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
            }
        }
    }
    return result;
};

function ReviewList({
    refreshTrigger,
    onReviewsLoaded,
    isPublic = false,
    scrollToId,
    currentUserId,
    onReviewUpdated,
    onScrollComplete,
    reviewerNameUpdate,
    reviewerPictureUpdate,
    reviewerThemeUpdate,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const { currentThemeId } = useTheme();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(defaultFilters);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
            setFilters(defaultFilters);
            try {
                let response;
                if (isPublic) {
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL}/reviews/public`,
                    );
                } else {
                    const token = await getAccessTokenSilently();
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL}/reviews`,
                        { headers: { Authorization: `Bearer ${token}` } },
                    );
                }
                const data = await response.json();
                if (!response.ok) {
                    setError(text.errorFailedFetch);
                    return;
                }
                setReviews(alternateReviewers(data));
                onReviewsLoaded?.(data.length);
            } catch (err) {
                setError(text.errorGeneric);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [refreshTrigger, isPublic, getAccessTokenSilently]);

    useEffect(() => {
        if (!scrollToId) return;
        const timer = setTimeout(() => {
            const el = document.getElementById(`review-${scrollToId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                onScrollComplete?.();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [scrollToId, reviews]);

    useEffect(() => {
        if (!reviewerPictureUpdate) return;
        setReviews((prev) =>
            prev.map((r) =>
                r.user_id === reviewerPictureUpdate.userId
                    ? { ...r, reviewer_picture: reviewerPictureUpdate.picture }
                    : r,
            ),
        );
    }, [reviewerPictureUpdate]);

    useEffect(() => {
        if (!reviewerNameUpdate) return;
        setReviews((prev) =>
            prev.map((r) =>
                r.user_id === reviewerNameUpdate.userId
                    ? { ...r, reviewer_name: reviewerNameUpdate.name }
                    : r,
            ),
        );
    }, [reviewerNameUpdate]);

    useEffect(() => {
        if (!reviewerThemeUpdate) return;
        setReviews((prev) =>
            prev.map((r) =>
                r.user_id === reviewerThemeUpdate.userId
                    ? { ...r, theme_id: reviewerThemeUpdate.themeId }
                    : r,
            ),
        );
    }, [reviewerThemeUpdate]);

    const filteredReviews = useReviewFilter(reviews, filters, currentUserId);

    if (loading) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="loading"
                    className={
                        statusCardClass +
                        " flex items-center justify-center min-h-20"
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <LoadingDots
                        logoColours={currentThemeId === "default-theme"}
                    />
                </motion.div>
            </AnimatePresence>
        );
    }

    if (error) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="error"
                    className={statusCardClass}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="text-error-600">
                        {text.errorFormatted(error)}
                    </p>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (reviews.length === 0) {
        return (
            <>
                {!isPublic && (
                    <ReviewSearch
                        filters={filters}
                        onChange={setFilters}
                        reviews={reviews}
                        currentUserId={currentUserId}
                    />
                )}
                <AnimatePresence mode="wait">
                    <motion.div
                        key="no-reviews"
                        className={
                            statusCardClass +
                            " min-h-20 flex items-center justify-center"
                        }
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-text-mid">{text.noReviews}</p>
                    </motion.div>
                </AnimatePresence>
            </>
        );
    }

    return (
        <ReviewListProvider>
            {!isPublic && (
                <ReviewSearch
                    filters={filters}
                    onChange={setFilters}
                    reviews={reviews}
                    currentUserId={currentUserId}
                />
            )}
            <div className="flex flex-col gap-4">
                {filteredReviews.length === 0 ? (
                    <motion.div
                        className={
                            statusCardClass +
                            " min-h-20 flex items-center justify-center"
                        }
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-text-mid">{text.noReviewsMatch}</p>
                    </motion.div>
                ) : (
                    filteredReviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={currentUserId}
                            onReviewUpdated={onReviewUpdated}
                        />
                    ))
                )}
            </div>
        </ReviewListProvider>
    );
}

export default ReviewList;
