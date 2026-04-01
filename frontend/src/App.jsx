import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/ui/Button";
import Navbar from "./components/layout/Navbar";
import ReviewForm from "./components/reviews/ReviewForm";
import ReviewList from "./components/reviews/ReviewList";
import { themes } from "./themes";
import { text } from "./resources";
import { useDarkMode } from "./hooks/useDarkMode";
import { smoothScrollToTop, isDefaultAvatar } from "./utils";

function App() {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const isDarkMode = useDarkMode();

    const [formOpen, setFormOpen] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [isPublicOnly, setIsPublicOnly] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [scrollToId, setScrollToId] = useState(null);

    const [currentUserName, setCurrentUserName] = useState(undefined);
    const [currentUserPicture, setCurrentUserPicture] = useState(undefined);

    const handleReviewSubmitted = (newId) => {
        setJustSubmitted(true);
        setScrollToId(newId);
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleReviewsLoaded = (count) => {
        // Only auto-expand the form if not in public only mode
        if (count === 0 && !isPublicOnly) setFormOpen(true);
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

    useEffect(() => {
        if (!user) return;
        if (currentUserName === undefined) setCurrentUserName(user.name);
        const fetchCurrentPicture = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/user/picture`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                const data = await response.json();
                if (response.ok)
                    setCurrentUserPicture(
                        isDefaultAvatar(data.picture) ? null : data.picture,
                    );
            } catch (err) {
                setCurrentUserPicture(null);
            }
        };
        fetchCurrentPicture();
    }, [user, isAuthenticated, getAccessTokenSilently]);

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
                <div className="max-w-3xl mx-auto py-8 px-4">
                    <ReviewList
                        isPublic
                        onScrollComplete={() => setScrollToId(null)}
                    />
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
            <Navbar
                isPublic={isPublicOnly}
                onTogglePublic={setIsPublicOnly}
                currentUserPicture={currentUserPicture}
                onPictureUpdated={(picture) => {
                    setCurrentUserPicture(picture);
                    setRefreshTrigger((prev) => prev + 1);
                }}
                currentUserName={currentUserName}
                onNameUpdated={(name) => {
                    setCurrentUserName(name);
                    setRefreshTrigger((prev) => prev + 1);
                }}
            />
            <div className="max-w-3xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-0">
                {/* Floating Write a Review Button (desktop only) */}
                <div className="hidden lg:block">
                    <button
                        onClick={() => {
                            if (!formOpen) {
                                setFormOpen(true);
                                // Try native smooth scroll, fallback to manual animation
                                let scrolled = false;
                                try {
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                    scrolled = true;
                                } catch (e) {}
                                if (!scrolled || window.pageYOffset > 10) {
                                    smoothScrollToTop();
                                }
                            } else {
                                setFormOpen(false);
                            }
                        }}
                        className="fixed bottom-8 right-8 z-40 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-colors duration-200 drop-shadow-lg"
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
                </div>
                {/* Top button for mobile/tablet */}
                <div className="mb-6 flex justify-center lg:hidden">
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
                                currentUserPicture={currentUserPicture}
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
                    onScrollComplete={() => setScrollToId(null)}
                />
            </div>
        </motion.div>
    );
}

export default App;
