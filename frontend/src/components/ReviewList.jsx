import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ReviewCard from "./ReviewCard";
import { text } from "../resources";
import { ReviewListProvider } from "../contexts/ReviewListContext";

const statusCardClass =
    "bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200";

function ReviewList({
    refreshTrigger,
    onReviewsLoaded,
    isPublic = false,
    scrollToId,
    currentUserId,
    onReviewDeleted,
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

                setReviews(data);
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
                <p className="text-text-light">{text.loadingReviews}</p>
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
                        onReviewDeleted={onReviewDeleted}
                    />
                ))}
            </div>
        </ReviewListProvider>
    );
}

export default ReviewList;
