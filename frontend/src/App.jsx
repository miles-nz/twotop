import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/ui/Button";
import Navbar from "./components/layout/Navbar";
import ReviewForm from "./components/reviews/ReviewForm";
import ReviewList from "./components/reviews/ReviewList";
import WelcomeTutorial from "./components/tutorial/WelcomeTutorial";
import { text } from "./resources";
import { applyThemeToCss } from "./utils";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import usePullToRefresh from "./hooks/usePullToRefresh";
import PullToRefreshIndicator from "./components/ui/PullToRefreshIndicator";

function AppContent({ onRegisterRefresh }) {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const { currentThemeId, isDarkMode } = useTheme();
    const {
        fetchCurrentUser,
        fetchPreferences,
        hasSeenTutorial,
        markTutorialSeen,
    } = useUser();
    const { pullDistance, refreshing } = usePullToRefresh();

    const [formOpen, setFormOpen] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [scrollToId, setScrollToId] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [reviewerPictureUpdate, setReviewerPictureUpdate] = useState(null);
    const [reviewerNameUpdate, setReviewerNameUpdate] = useState(null);
    const [reviewerThemeUpdate, setReviewerThemeUpdate] = useState(null);

    useEffect(() => {
        onRegisterRefresh(() => setRefreshTrigger((prev) => prev + 1));
    }, []);

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

    applyThemeToCss(user ? currentThemeId : "default-theme", isDarkMode);

    useEffect(() => {
        const themeId = user ? currentThemeId : "default-theme";
        applyThemeToCss(themeId, isDarkMode);
    }, [user, isDarkMode, currentThemeId]);

    useEffect(() => {
        if (!user) return;
        fetchCurrentUser();
        fetchPreferences();
    }, [user, isAuthenticated, getAccessTokenSilently]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const prevThemeId = useRef(currentThemeId);

    useEffect(() => {
        if (currentThemeId === prevThemeId.current) return;
        prevThemeId.current = currentThemeId;
        if (user?.sub) {
            setReviewerThemeUpdate({
                themeId: currentThemeId,
                userId: user.sub,
            });
        }
    }, [currentThemeId]);

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="min-h-screen w-full bg-surface-100"
            >
                <PullToRefreshIndicator
                    pullDistance={pullDistance}
                    refreshing={refreshing}
                />
                <Navbar />
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
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                refreshing={refreshing}
            />
            {(showTutorial || !hasSeenTutorial) && (
                <WelcomeTutorial
                    onDismiss={() => {
                        setShowTutorial(false);
                        markTutorialSeen();
                    }}
                />
            )}
            <Navbar
                onPictureUpdated={(newPicture) => {
                    setReviewerPictureUpdate({
                        picture: newPicture,
                        userId: user.sub,
                    });
                }}
                onNameUpdated={(newName) => {
                    setReviewerNameUpdate({ name: newName, userId: user.sub });
                }}
                onShowTutorial={() => setShowTutorial(true)}
            />
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
                    className="fixed bottom-8 right-8 z-40 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-colors duration-200 drop-shadow-lg cursor-pointer"
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
                            <ReviewForm
                                onReviewSubmitted={handleReviewSubmitted}
                            />
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
                    reviewerPictureUpdate={reviewerPictureUpdate}
                    reviewerNameUpdate={reviewerNameUpdate}
                    reviewerThemeUpdate={reviewerThemeUpdate}
                />
            </div>
        </motion.div>
    );
}

function App() {
    const triggerRefreshRef = useRef(null);
    applyThemeToCss("default-theme", false);

    return (
        <ThemeProvider>
            <UserProvider>
                <AppContent
                    onRegisterRefresh={(fn) => {
                        triggerRefreshRef.current = fn;
                    }}
                />
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
