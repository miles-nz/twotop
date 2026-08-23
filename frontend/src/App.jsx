import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import ReviewsPage from "./pages/ReviewsPage";
import ListsPage from "./pages/ListsPage";
import ProfilePage from "./pages/ProfilePage";
import WelcomeTutorial from "./components/tutorial/WelcomeTutorial";
import ReviewList from "./components/reviews/ReviewList";
import LoadingDots from "./components/ui/LoadingDots";
import { applyThemeToCss } from "./utils";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import usePullToRefresh from "./hooks/usePullToRefresh";
import PullToRefreshIndicator from "./components/ui/PullToRefreshIndicator";
import ListDetailPage from "./pages/ListDetailPage";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import SharedListPage from "./pages/SharedListPage";

function AppContent() {
    const { isAuthenticated, isLoading, user, getAccessTokenSilently } =
        useAuth0();
    const { currentThemeId, isDarkMode } = useTheme();
    const {
        fetchCurrentUser,
        fetchPreferences,
        hasSeenTutorial,
        markTutorialSeen,
        showTutorial,
        setShowTutorial,
        hasSeenNamePrompt,
        markNamePromptSeen,
        setReviewerThemeUpdate,
        preferencesLoaded,
    } = useUser();

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
                <PullToRefreshIndicator
                    pullDistance={pullDistance}
                    refreshing={refreshing}
                />
                <Navbar />
                <Routes>
                    <Route path="/reviews/:id" element={<ReviewDetailPage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route
                        path="*"
                        element={
                            <div className="max-w-3xl mx-auto py-8 px-4">
                                <ReviewList isPublic />
                            </div>
                        }
                    />
                    <Route
                        path="/lists/shared/:token"
                        element={<SharedListPage />}
                    />
                </Routes>
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
            {preferencesLoaded && (showTutorial || !hasSeenTutorial) && (
                <WelcomeTutorial
                    showNamePrompt={!hasSeenNamePrompt}
                    onDismiss={() => {
                        setShowTutorial(false);
                        markTutorialSeen();
                        markNamePromptSeen();
                    }}
                    onNameSaved={markNamePromptSeen}
                />
            )}
            <Navbar
                onListShareAccepted={() =>
                    setListRefreshTrigger((prev) => prev + 1)
                }
            />
            <Routes>
                <Route path="/" element={<ReviewsPage />} />
                <Route path="/reviews" element={<Navigate to="/" replace />} />
                <Route path="/reviews/:id" element={<ReviewDetailPage />} />
                <Route
                    path="/lists"
                    element={<ListsPage refreshTrigger={listRefreshTrigger} />}
                />
                <Route path="/lists/:id" element={<ListDetailPage />} />
                <Route
                    path="/lists/shared/:token"
                    element={<SharedListPage />}
                />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
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
