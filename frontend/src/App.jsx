import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import Navbar from "./components/Navbar";
import Button from "./components/Button";
import { themes } from "./themes";
import { text } from "./resources";

function App() {
    const { isLoading, isAuthenticated, user } = useAuth0();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);
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
        if (!user) return;
        const theme = themes[user.sub] || {};
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-surface-100 flex items-center justify-center">
                <p className="text-text-light">{text.loading}</p>
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
                <Navbar />
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
            <Navbar />
            <div className="max-w-2xl mx-auto py-10 px-4">
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
                    scrollToId={scrollToId}
                />
            </div>
        </motion.div>
    );
}

export default App;
