import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewListProvider } from "../contexts/ReviewListContext";
import ReviewCard from "../components/reviews/ReviewCard";
import LoadingDots from "../components/ui/LoadingDots";
import { useTheme } from "../contexts/ThemeContext";
import { text } from "../resources";

const statusCardClass =
    "bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200 flex items-center justify-center min-h-20";

export default function ReviewDetailPage() {
    const { id } = useParams();
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const { currentThemeId } = useTheme();
    const [review, setReview] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isForbidden, setIsForbidden] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const headers = {};
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    headers.Authorization = `Bearer ${token}`;
                }
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/reviews/${id}`,
                    { headers },
                );
                if (res.status === 403) {
                    if (isAuthenticated) {
                        setIsForbidden(true);
                    } else {
                        setIsPrivate(true);
                    }
                    return;
                }
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                const data = await res.json();
                setReview(data);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [id, isAuthenticated]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="loading"
                        className={statusCardClass}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LoadingDots
                            logoColours={currentThemeId === "default-theme"}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
                <div className={statusCardClass}>
                    <p className="text-text-mid">Review not found.</p>
                </div>
            </div>
        );
    }

    if (isPrivate) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
                <div className={statusCardClass + " flex-col gap-3"}>
                    <p className="text-text-dark font-medium">
                        {text.privateReview}
                    </p>
                    <p className="text-sm text-text-light">
                        {text.privateReviewLoginMessage}
                    </p>
                </div>
            </div>
        );
    }

    if (isForbidden) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
                <div className={statusCardClass + " flex-col gap-3"}>
                    <p className="text-text-dark font-medium">
                        {text.privateReview}
                    </p>
                    <p className="text-sm text-text-light">
                        {text.forbiddenReviewMessage}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
            <ReviewListProvider>
                <ReviewCard
                    review={review}
                    currentUserId={user?.sub}
                    onReviewUpdated={(updatedId) => {
                        // refetch on update
                        if (updatedId) {
                            fetch(
                                `${import.meta.env.VITE_API_URL}/reviews/${id}`,
                            )
                                .then((r) => r.json())
                                .then(setReview)
                                .catch(() => {});
                        }
                    }}
                    isDetailPage
                />
            </ReviewListProvider>
        </div>
    );
}
