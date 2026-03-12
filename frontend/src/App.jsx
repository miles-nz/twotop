import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import Navbar from "./components/Navbar";
import Button from "./components/Button";

function App() {
    const { isLoading, isAuthenticated, user, loginWithRedirect, logout } =
        useAuth0();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);

    const handleReviewSubmitted = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleReviewsLoaded = (count) => {
        if (count === 0) setFormOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-surface-100 flex items-center justify-center">
                <p className="text-text-light">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="min-h-screen w-full bg-surface-100 flex items-center justify-center"
            >
                <div className="min-h-screen bg-surface-100 flex items-center justify-center">
                    <div className="bg-surface-50 rounded-2xl shadow-md p-8 w-full max-w-md text-center border border-surface-200">
                        <h1
                            style={{ fontFamily: "var(--font-title)" }}
                            className="text-9xl text-text-dark mb-2"
                        >
                            TBC
                        </h1>
                        <div className="mb-6 text-text-light">
                            <p className="text-3xl">the brunch club</p>
                            <p className="text-2xs">(to be confirmed)</p>
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={() => loginWithRedirect()}>
                                Log in
                            </Button>
                        </div>
                    </div>
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
                    <Button onClick={() => setFormOpen((prev) => !prev)}>
                        <span className="flex items-center gap-2">
                            <motion.span
                                animate={{ rotate: formOpen ? 45 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="inline-block text-lg leading-none"
                            >
                                +
                            </motion.span>
                            {formOpen ? "Close" : "Write a Review"}
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
                />
            </div>
        </motion.div>
    );
}

export default App;
