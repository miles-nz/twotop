import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import RatingField from "./RatingField";
import Button from "./Button";

function ReviewForm({ onReviewSubmitted }) {
    const { getAccessTokenSilently, user } = useAuth0();

    const [restaurantName, setRestaurantName] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [foodRating, setFoodRating] = useState(null);
    const [drinkRating, setDrinkRating] = useState(null);
    const [ambienceRating, setAmbienceRating] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const token = await getAccessTokenSilently();
            console.log("user:", user);
            console.log("reviewer_name:", user?.name);
            const response = await fetch("http://localhost:3000/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    restaurant_name: restaurantName,
                    review_text: reviewText,
                    food_rating: foodRating ? parseFloat(foodRating) : null,
                    drink_rating: drinkRating ? parseFloat(drinkRating) : null,
                    ambience_rating: ambienceRating
                        ? parseFloat(ambienceRating)
                        : null,
                    reviewer_name: user?.name || null,
                    reviewer_picture: user?.picture || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.errors || data.error || "Failed to submit review.",
                );
                return;
            }

            setRestaurantName("");
            setReviewText("");
            setFoodRating("");
            setDrinkRating("");
            setAmbienceRating("");
            onReviewSubmitted();
        } catch (err) {
            setError(err.message || "Something went wrong, please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-50 rounded-2xl shadow-md p-6 mb-6"
        >
            <h2 className="text-xl font-bold text-secondary-600 mb-4">
                Write a Review
            </h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    Restaurant Name
                </label>
                <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-text-light"
                    placeholder="e.g. McCafé"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-2">
                    Ratings
                </label>
                <div className="grid grid-cols-3 gap-4">
                    <RatingField
                        label="Food"
                        value={foodRating}
                        onChange={setFoodRating}
                    />
                    <RatingField
                        label="Drinks"
                        value={drinkRating}
                        onChange={setDrinkRating}
                    />
                    <RatingField
                        label="Ambience"
                        value={ambienceRating}
                        onChange={setAmbienceRating}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    Review
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-500 h-28 resize-none"
                    placeholder="Write your review here..."
                />
            </div>

            {error && (
                <div className="mb-4 bg-primary-50 border border-primary-200 rounded-lg p-3">
                    {Array.isArray(error) ? (
                        error.map((err, index) => (
                            <p key={index} className="text-primary-600 text-sm">
                                {err}
                            </p>
                        ))
                    ) : (
                        <p className="text-primary-600 text-sm">{error}</p>
                    )}
                </div>
            )}

            <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
            </Button>
        </motion.div>
    );
}

export default ReviewForm;
