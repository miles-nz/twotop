import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import StarRating from "./StarRating";
import RatingField from "./RatingField";

function ReviewList({ refreshTrigger }) {
    const { getAccessTokenSilently } = useAuth0();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = await getAccessTokenSilently();
                const response = await fetch("http://localhost:3000/reviews", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Failed to fetch reviews.");
                    return;
                }

                setReviews(data);
            } catch (err) {
                setError(
                    err.message || "Something went wrong, please try again.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-text-light">Loading reviews...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-primary-600">Error: {error}</p>
            </div>
        );
    }
    if (reviews.length === 0) {
        return (
            <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-text-light">No reviews yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-secondary-600 mb-4">
                Reviews
            </h2>
            <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-surface-50 rounded-2xl shadow-md p-6 border border-surface-200 border-1-4 border-1-secondary-400"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-text-dark">
                                {review.restaurant_name}
                            </h3>
                            <span className="text-sm text-text-light">
                                {new Date(
                                    review.created_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>

                        {(review.food_rating ||
                            review.drink_rating ||
                            review.ambience_rating) && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {review.food_rating && (
                                    <RatingField
                                        label="Food"
                                        value={review.food_rating}
                                        readOnly
                                    />
                                )}
                                {review.drink_rating && (
                                    <RatingField
                                        label="Drinks"
                                        value={review.drink_rating}
                                        readOnly
                                    />
                                )}
                                {review.ambience_rating && (
                                    <RatingField
                                        label="Ambience"
                                        value={review.ambience_rating}
                                        readOnly
                                    />
                                )}
                            </div>
                        )}

                        {review.review_text && (
                            <p className="text-text-mid text-sm leading-relaxed">
                                {review.review_text}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReviewList;
