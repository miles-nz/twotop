import { useTheme } from "../../contexts/ThemeContext";
import { themes } from "../../themes";
import { motion } from "framer-motion";
import SingleReviewCard from "./SingleReviewCard";
import CollaborativeReviewCard from "../reviews/CollaborativeReviewCard";

function ReviewCard({
    review,
    currentUserId,
    onReviewUpdated,
    isDetailPage = false,
}) {
    const { isDarkMode } = useTheme();
    const themeSet = isDarkMode ? themes.dark : themes.light;
    const theme = themeSet[review.theme_id] || themeSet["default-theme"];

    return (
        <motion.div
            id={`review-${review.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={theme}
            className="bg-surface-50/50 rounded-2xl shadow-sm border border-surface-200 border-l-3 border-l-secondary-400 overflow-hidden transition-shadow duration-300 hover:shadow-lg"
        >
            {review.is_collaborative ? (
                <CollaborativeReviewCard
                    review={review}
                    currentUserId={currentUserId}
                    onReviewUpdated={onReviewUpdated}
                    isDetailPage={isDetailPage}
                />
            ) : (
                <SingleReviewCard
                    review={review}
                    currentUserId={currentUserId}
                    onReviewUpdated={onReviewUpdated}
                    isDetailPage={isDetailPage}
                />
            )}
        </motion.div>
    );
}

export default ReviewCard;
