import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import RatingField from "./RatingField";
import Button from "./Button";
import { text, placeholders } from "../resources";
import { ImagePlus, X } from "lucide-react";

const inputClass =
    "w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400";

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
    const [images, setImages] = useState([]);

    const fileInputRef = useRef(null);

    const getLocalDate = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("restaurant_name", restaurantName);
            formData.append("review_text", reviewText);
            formData.append(
                "food_rating",
                foodRating ? parseFloat(foodRating) : "",
            );
            formData.append(
                "drink_rating",
                drinkRating ? parseFloat(drinkRating) : "",
            );
            formData.append(
                "ambience_rating",
                ambienceRating ? parseFloat(ambienceRating) : "",
            );
            formData.append("visit_date", visitDate || getLocalDate());
            formData.append("reviewer_name", user?.name || "");
            formData.append("reviewer_picture", user?.picture || "");
            formData.append("is_public", isPublic);
            images.forEach((image) => formData.append("images", image));

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
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
            setImages([]);
            onReviewSubmitted(data.id);
            setIsPublic(false);
        } catch (err) {
            setError(err.message || text.errorGeneric);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        const oversizedFiles = files.filter(
            (file) => file.size > 20 * 1024 * 1024,
        );
        if (oversizedFiles.length > 0) {
            setError([text.errorImageSize]);
            return;
        }

        if (files.length + images.length > 5) {
            setError([text.errorMaxImages]);
            return;
        }

        setImages((prev) => [...prev, ...files].slice(0, 5));
    };

    const handleImageRemove = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
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
                    className={`${inputClass} placeholder-text-light`}
                    placeholder={text.restaurantNamePlaceholder(placeholder)}
                />
            </div>

            <div className="mb-4 pr-[26px] md:pr-0">
                <label className="block text-sm font-medium text-text-mid mb-1">
                    {text.dateVisitedLabel}
                </label>
                <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setvisitDate(e.target.value)}
                    className={inputClass}
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
                <div className="relative">
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className={`${inputClass} h-28 resize-none placeholder-text-light`}
                        placeholder={text.reviewNotesPlaceholder}
                    />
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current.click();
                        }}
                        className="absolute bottom-2 right-2 pb-2 text-secondary-400 hover:text-secondary-600 cursor-pointer transition-colors"
                    >
                        <ImagePlus size={24} />
                    </button>
                </div>
            </div>

            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative">
                            <img
                                src={URL.createObjectURL(image)}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => handleImageRemove(index)}
                                className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 text-xs flex items-center justify-center cursor-pointer"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
                <div className="bg-surface-50 rounded-2xl shadow-md p-6 mb-4 border border-surface-200">
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

            <div className="flex items-center justify-between">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="secondary"
                >
                    {submitting ? text.submitting : text.submitReview}
                </Button>
            </div>
        </motion.div>
    );
}

export default ReviewForm;
