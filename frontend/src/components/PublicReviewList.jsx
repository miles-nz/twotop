import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewCard from "./ReviewCard";
import { text } from "../resources";

function PublicReviewList() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicReviews = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/reviews/public`,
                );
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error);
                    return;
                }

                setReviews(data);
            } catch (err) {
                setError();
            } finally {
                setLoading(false);
            }
        };

        fetchPublicReviews();
    }, []);

    if (loading)
        return (
            <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-text-light">{text.loadingReviews}</p>
            </div>
        );

    if (error)
        return (
            <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-primary-600">{text.errorFormatted(error)}</p>
            </div>
        );

    if (reviews.length === 0)
        return (
            <div className="bg-primary-200 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                <p className="text-text-light">{text.noPublicReviews}</p>
            </div>
        );

    return (
        <div>
            <AnimatePresence>
                <div className="flex flex-col gap-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} size="sm" />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
}

export default PublicReviewList;
