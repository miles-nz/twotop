import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/ui/Button";
import Navbar from "./components/layout/Navbar";
import ReviewForm from "./components/reviews/ReviewForm";
import ReviewList from "./components/reviews/ReviewList";
import LoadingDots from "./components/ui/LoadingDots";
import { themes } from "./themes";
import { text } from "./resources";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
    const { isLoading, isAuthenticated, user } = useAuth0();
    const isDarkMode = useDarkMode();

    const [formOpen, setFormOpen] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [isPublicOnly, setIsPublicOnly] = useState(false);

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

    useEffect(() => {
        // Apply appropriate theme based on dark mode preference
        // If user is logged in, use their personalized theme
        // Otherwise, use the default theme colors adjusted for dark mode
        if (user) {
            const themeSet = isDarkMode ? themes.dark : themes.light;
            const theme = themeSet[user.sub] || {};

            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        } else {
            // Apply default theme based on dark mode preference when logged out
            const defaultTheme = isDarkMode
                ? themes.dark.default
                : themes.light.default;
            Object.entries(defaultTheme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
    }, [user, isDarkMode]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-surface-100 flex items-center justify-center">
                <LoadingDots />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="min-h-screen w-full bg-surface-100"
            >
                <Navbar
                    isPublic={isPublicOnly}
                    onTogglePublic={setIsPublicOnly}
                />
                <div className="max-w-2xl mx-auto py-8 px-4">
                    <ReviewList isPublic />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen w-full bg-surface-100"
        >
            <Navbar isPublic={isPublicOnly} onTogglePublic={setIsPublicOnly} />
            <div className="max-w-2xl mx-auto pt-6 pb-10 px-4">
                <div className="mb-6 flex justify-center">
                    <Button
                        onClick={() => setFormOpen((prev) => !prev)}
                        variant="secondary"
                    >
                        <span className="flex items-center gap-2">
                            <motion.span
                                animate={{ rotate: formOpen ? 45 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="inline-block text-lg leading-none"
                            >
                                +
                            </motion.span>
                            {formOpen ? text.close : text.writeReview}
                        </span>
                    </Button>
                </div>
                <AnimatePresence>
                    {formOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <ReviewForm
                                onReviewSubmitted={handleReviewSubmitted}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <ReviewList
                    refreshTrigger={refreshTrigger}
                    onReviewsLoaded={handleReviewsLoaded}
                    isPublic={isPublicOnly}
                    scrollToId={scrollToId}
                    currentUserId={user.sub}
                    onReviewUpdated={(id) => {
                        if (id) setScrollToId(id);
                        setRefreshTrigger((prev) => prev + 1);
                    }}
                />
            </div>
        </motion.div>
    );
}

export default App;
