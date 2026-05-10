import { useState } from "react";
import { flushSync } from "react-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "../components/reviews/ReviewForm";
import ReviewList from "../components/reviews/ReviewList";
import { text } from "../resources";

export default function ReviewsPage({
    onReviewerPictureUpdate,
    onReviewerNameUpdate,
    onReviewerThemeUpdate,
}) {
    const { user } = useAuth0();
    const [formOpen, setFormOpen] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [scrollToId, setScrollToId] = useState(null);

    const handleReviewSubmitted = (newId) => {
        setJustSubmitted(true);
        setScrollToId(newId);
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleReviewsLoaded = (count) => {
        if (count === 0) setFormOpen(true);
        if (justSubmitted) {
            setFormOpen(false);
            setJustSubmitted(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
            <button
                onClick={() => {
                    if (!formOpen) {
                        flushSync(() => setFormOpen(true));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                        setFormOpen(false);
                    }
                }}
                className="fixed bottom-22 sm:bottom-8 right-4 sm:right-8 z-40 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-colors duration-200 drop-shadow-lg cursor-pointer"
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
            <AnimatePresence>
                {formOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
                    </motion.div>
                )}
            </AnimatePresence>
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
