import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronLeft } from "lucide-react";
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
            setLoading(true);
            setReview(null);
            setIsPrivate(false);
            setIsForbidden(false);
            setNotFound(false);
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

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
            <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-text-light hover:text-text-dark transition-colors mb-4"
            >
                <ChevronLeft size={16} />
                {text.reviews}
            </Link>

            {loading && (
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
            )}

            {notFound && (
                <div className={statusCardClass}>
                    <p className="text-text-mid">Review not found.</p>
                </div>
            )}

            {isPrivate && (
                <div className={statusCardClass + " flex-col gap-3"}>
                    <p className="text-text-dark font-medium">
                        {text.privateReview}
                    </p>
                    <p className="text-sm text-text-light">
                        {text.privateReviewLoginMessage}
                    </p>
                </div>
            )}

            {isForbidden && (
                <div className={statusCardClass + " flex-col gap-3"}>
                    <p className="text-text-dark font-medium">
                        {text.privateReview}
                    </p>
                    <p className="text-sm text-text-light">
                        {text.forbiddenReviewMessage}
                    </p>
                </div>
            )}

            {review && (
                <ReviewListProvider>
                    <ReviewCard
                        review={review}
                        currentUserId={user?.sub}
                        onReviewUpdated={(updatedId) => {
                            if (!updatedId) return;
                            (async () => {
                                try {
                                    const headers = {};
                                    if (isAuthenticated) {
                                        const token =
                                            await getAccessTokenSilently();
                                        headers.Authorization = `Bearer ${token}`;
                                    }
                                    const res = await fetch(
                                        `${import.meta.env.VITE_API_URL}/reviews/${id}`,
                                        { headers },
                                    );
                                    const data = await res.json();
                                    if (res.ok) setReview(data);
                                } catch {
                                    // keep showing the previous review data
                                }
                            })();
                        }}
                        isDetailPage
                    />
                </ReviewListProvider>
            )}
        </div>
    );
}
