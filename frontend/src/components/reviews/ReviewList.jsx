import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingDots from "../ui/LoadingDots";
import { ReviewListProvider } from "../../contexts/ReviewListContext";
import ReviewCard from "../cards/ReviewCard";
import { text } from "../../resources";

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
    isDarkMode,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
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
        const el = document.getElementById(`review-${scrollToId}`);
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                onScrollComplete?.();
            }, 1000);
        }
    }, [scrollToId, reviews]);

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
                    <LoadingDots />
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
        );
    }

    return (
        <ReviewListProvider>
            <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        currentUserId={currentUserId}
                        onReviewUpdated={onReviewUpdated}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>
        </ReviewListProvider>
    );
}

export default ReviewList;
