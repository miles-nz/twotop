import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import RatingField from "./RatingField";
import Button from "./Button";
import { text, placeholders } from "../resources";

const getRandomPlaceholder = () => {
    return placeholders[Math.floor(Math.random() * placeholders.length)];
};

function ReviewForm({ onReviewSubmitted }) {
    const { getAccessTokenSilently, user } = useAuth0();

    const [restaurantName, setRestaurantName] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [foodRating, setFoodRating] = useState(null);
    const [drinkRating, setDrinkRating] = useState(null);
    const [ambienceRating, setAmbienceRating] = useState(null);
    const [visitDate, setvisitDate] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [placeholder] = useState(getRandomPlaceholder());
    const [isPublic, setIsPublic] = useState(false);

    const getLocalDate = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        restaurant_name: restaurantName,
                        review_text: reviewText,
                        food_rating: foodRating ? parseFloat(foodRating) : null,
                        drink_rating: drinkRating
                            ? parseFloat(drinkRating)
                            : null,
                        ambience_rating: ambienceRating
                            ? parseFloat(ambienceRating)
                            : null,
                        visit_date: visitDate || getLocalDate(),
                        reviewer_name: user?.name || null,
                        reviewer_picture: user?.picture || null,
                        is_public: isPublic,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.errors || data.error || text.errorFailedSubmit);
                return;
            }

            setRestaurantName("");
            setReviewText("");
            setFoodRating("");
            setDrinkRating("");
            setAmbienceRating("");
            setvisitDate("");
            onReviewSubmitted();
            setIsPublic(false);
        } catch (err) {
            setError(err.message || text.errorGeneric);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-primary-200 rounded-2xl shadow-md p-6 mb-6 border border-surface-200"
        >
            <h2 className="text-xl font-bold text-secondary-600 mb-4">
                {text.writeReview}
            </h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    {text.restaurantNameLabel}
                </label>
                <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-text-dark bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 placeholder-text-light"
                    placeholder={text.restaurantNamePlaceholder(placeholder)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    {text.dateVisitedLabel}
                </label>
                <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setvisitDate(e.target.value)}
                    className={`w-full max-w-full box-border border border-surface-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-400 bg-surface-50 ${
                        visitDate ? "text-text-dark" : "text-text-light"
                    }`}
                    style={{
                        color: visitDate
                            ? "var(--color-text-dark)"
                            : "var(--color-text-mid)",
                        opacity: 1,
                    }}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-2">
                    {text.ratingsLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RatingField
                        label={text.foodLabel}
                        value={foodRating}
                        onChange={setFoodRating}
                    />
                    <RatingField
                        label={text.drinksLabel}
                        value={drinkRating}
                        onChange={setDrinkRating}
                    />
                    <RatingField
                        label={text.ambienceLabel}
                        value={ambienceRating}
                        onChange={setAmbienceRating}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    {text.reviewNotesLabel}
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-text-dark bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 h-28 resize-none placeholder-text-light"
                    placeholder={text.reviewNotesPlaceholder}
                />
            </div>

            <div className="mb-4 flex items-center justify-between bg-surface-100 rounded-lg px-4 py-3 border border-surface-200">
                <div>
                    <p className="text-sm font-medium text-text-dark">
                        {text.markAsPublic}
                    </p>
                </div>
                <button
                    onClick={() => setIsPublic((prev) => !prev)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                        isPublic ? "bg-secondary-500" : "bg-surface-300"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            isPublic ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            {error && (
                <div className="bg-surface-50 rounded-2xl shadow-md p-6 mb-6 border border-surface-200">
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

            <Button
                onClick={handleSubmit}
                disabled={submitting}
                variant="secondary"
            >
                {submitting ? text.submitting : text.submitReview}
            </Button>
        </motion.div>
    );
}

export default ReviewForm;
