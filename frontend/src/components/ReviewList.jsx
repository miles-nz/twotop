import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RatingField from "./RatingField";
import Avatar from "./Avatar";

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
            <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-surface-50 rounded-2xl shadow-md p-6 border border-surface-200 border-1-4 border-1-secondary-400 overflow-hidden transition-transform duration-200 hover:translate-y-1 hover:shadow-lg"
                    >
                        <div className="p-6 pb-4">
                            <div className="flex items-start justify-between">
                                <h3 className="text-2xl font-bold text-text-dark">
                                    {review.restaurant_name}
                                </h3>
                                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                    <span className="text-sm text-text-light ml-4 mt-1 whitespace-nowrap">
                                        {new Date(
                                            review.visit_date,
                                        ).toLocaleDateString()}
                                    </span>
                                    <Avatar
                                        name={review.reviewer_name}
                                        picture={review.reviewer_picture}
                                        size="sm"
                                    />
                                </div>
                            </div>
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
                            <>
                                <div className="border-t border-surface-200 mx-6" />
                                <div className="px-6 py-4">
                                    <p className="text-text-mid text-sm leading-relaxed">
                                        {review.review_text}
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default ReviewList;
