import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { ReviewListProvider } from "../../contexts/ReviewListContext";
import ReviewCard from "../cards/ReviewCard";
import { text } from "../../resources";

const statusCardClass =
    "bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200";

function ReviewList({
    refreshTrigger,
    onReviewsLoaded,
    isPublic = false,
    scrollToId,
    currentUserId,
    onReviewUpdated,
}) {
    const { getAccessTokenSilently } = useAuth0();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    [result[i], result[swapIndex]] = [
                        result[swapIndex],
                        result[i],
                    ];
                }
            }
        }

        return result;
    };

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
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                }

                const data = await response.json();

                if (!response.ok) {
                    setError(text.errorFailedFetch);
                    return;
                }

                setReviews(alternateReviewers(data));
                if (onReviewsLoaded) onReviewsLoaded(data.length);
            } catch (err) {
                setError(text.errorGeneric);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [refreshTrigger, isPublic]);

    useEffect(() => {
        if (!scrollToId) return;
        const el = document.getElementById(`review-${scrollToId}`);
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
        }
    }, [scrollToId, reviews]);

    if (loading) {
        return (
            <div className={statusCardClass}>
                <div className="flex items-center justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary-400"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className={statusCardClass}>
                <p className="text-primary-600">{text.errorFormatted(error)}</p>
            </div>
        );
    }
    if (reviews.length === 0) {
        return (
            <div className={statusCardClass}>
                <p className="text-text-mid">{text.noReviews}</p>
            </div>
        );
    }

    return (
        <ReviewListProvider>
            <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        size="sm"
                        isNew={review.id === scrollToId}
                        currentUserId={currentUserId}
                        onReviewUpdated={onReviewUpdated}
                    />
                ))}
            </div>
        </ReviewListProvider>
    );
}

export default ReviewList;
