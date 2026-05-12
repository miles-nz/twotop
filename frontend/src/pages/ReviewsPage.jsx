import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import ReviewFormModal from "../components/reviews/ReviewFormModal";
import ReviewList from "../components/reviews/ReviewList";
import { text } from "../resources";

export default function ReviewsPage({
    onReviewerPictureUpdate,
    onReviewerNameUpdate,
    onReviewerThemeUpdate,
}) {
    const { user } = useAuth0();
    const [formOpen, setFormOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [scrollToId, setScrollToId] = useState(null);

    const handleReviewSubmitted = (newId) => {
        setFormOpen(false);
        setScrollToId(newId);
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleReviewsLoaded = (count) => {
        if (count === 0) setFormOpen(true);
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
            <button
                onClick={() => setFormOpen((prev) => !prev)}
                className="fixed bottom-22 sm:bottom-8 right-4 sm:right-8 z-40 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-colors duration-200 drop-shadow-lg"
                style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                aria-label={formOpen ? text.close : text.writeReview}
            >
                <motion.span
                    animate={{ rotate: formOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                >
                    +
                </motion.span>
            </button>

            {formOpen && (
                <ReviewFormModal
                    key="review-form-modal"
                    onClose={() => setFormOpen(false)}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}

            <ReviewList
                refreshTrigger={refreshTrigger}
                onReviewsLoaded={handleReviewsLoaded}
                scrollToId={scrollToId}
                currentUserId={user.sub}
                onReviewUpdated={(id) => {
                    if (id) setScrollToId(id);
                    setRefreshTrigger((prev) => prev + 1);
                }}
                onScrollComplete={() => setScrollToId(null)}
                reviewerPictureUpdate={onReviewerPictureUpdate}
                reviewerNameUpdate={onReviewerNameUpdate}
                reviewerThemeUpdate={onReviewerThemeUpdate}
            />
        </div>
    );
}
