import { motion } from "framer-motion";
import RatingField from "./RatingField";
import Avatar from "./Avatar";
import { themes } from "../themes";
import { text } from "../resources";

function ReviewCard({ review, size = "md" }) {
    const theme = themes[review.user_id] || {};
    const themeStyle = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [key, value]),
    );

    return (
        <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={themeStyle}
            className="bg-surface-50 rounded-2xl shadow-md border border-surface-200 border-l-4 border-l-secondary-400 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-text-dark">
                        {review.restaurant_name}
                    </h3>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <span className="text-sm text-text-light whitespace-nowrap">
                            {new Date(review.visit_date).toLocaleDateString()}
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
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {review.food_rating && (
                            <RatingField
                                label={text.foodLabel}
                                value={review.food_rating}
                                readOnly
                                size={size}
                            />
                        )}
                        {review.drink_rating && (
                            <RatingField
                                label={text.drinksLabel}
                                value={review.drink_rating}
                                readOnly
                                size={size}
                            />
                        )}
                        {review.ambience_rating && (
                            <RatingField
                                label={text.ambienceLabel}
                                value={review.ambience_rating}
                                readOnly
                                size={size}
                            />
                        )}
                    </div>
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
    );
}

export default ReviewCard;
