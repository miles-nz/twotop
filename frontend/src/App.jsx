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
                <div className="flex items-center justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary-400"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
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
                    currentUserId={user.sub}
                    onReviewDeleted={() =>
                        setRefreshTrigger((prev) => prev + 1)
                    }
                />
            </div>
        </motion.div>
    );
}

export default App;
