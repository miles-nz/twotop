import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import ReviewsPage from "./pages/ReviewsPage";
import ListsPage from "./pages/ListsPage";
import WelcomeTutorial from "./components/tutorial/WelcomeTutorial";
import ReviewList from "./components/reviews/ReviewList";
import { applyThemeToCss } from "./utils";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import usePullToRefresh from "./hooks/usePullToRefresh";
import PullToRefreshIndicator from "./components/ui/PullToRefreshIndicator";
import ListDetailPage from "./pages/ListDetailPage";

function AppContent() {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const { currentThemeId, isDarkMode } = useTheme();
    const {
        fetchCurrentUser,
        fetchPreferences,
        hasSeenTutorial,
        markTutorialSeen,
    } = useUser();

    const [showTutorial, setShowTutorial] = useState(false);
    const [reviewerPictureUpdate, setReviewerPictureUpdate] = useState(null);
    const [reviewerNameUpdate, setReviewerNameUpdate] = useState(null);
    const [reviewerThemeUpdate, setReviewerThemeUpdate] = useState(null);
    const [listRefreshTrigger, setListRefreshTrigger] = useState(0);

    const { pullDistance, refreshing } = usePullToRefresh();

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
                onListShareAccepted={() =>
                    setListRefreshTrigger((prev) => prev + 1)
                }
            />
            <Routes>
                <Route
                    path="/"
                    element={
                        <ReviewsPage
                            onReviewerPictureUpdate={reviewerPictureUpdate}
                            onReviewerNameUpdate={reviewerNameUpdate}
                            onReviewerThemeUpdate={reviewerThemeUpdate}
                        />
                    }
                />
                <Route
                    path="/lists"
                    element={<ListsPage refreshTrigger={listRefreshTrigger} />}
                />
                <Route path="/lists/:id" element={<ListDetailPage />} />
            </Routes>
            <BottomNav />
        </motion.div>
    );
}

function App() {
    applyThemeToCss("default-theme", false);

    return (
        <ThemeProvider>
            <UserProvider>
                <AppContent />
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
