import { motion } from "framer-motion";
import RatingField from "./RatingField";
import Avatar from "./Avatar";
import { themes } from "../themes";
import { text } from "../resources";
import ImageCarousel from "./ImageCarousel";
import { useState, useEffect } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import ConfirmModal from "./ConfirmModal";
import { useReviewList } from "../contexts/ReviewListContext";

const glowShadow = "0 0 10px var(--color-primary-500)";

function ReviewCard({
    review,
    size = "md",
    isNew,
    currentUserId,
    onReviewDeleted,
}) {
    const theme = themes[review.user_id] || {};
    const themeStyle = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [key, value]),
    );

    const {
        expandedId,
        handleExpand,
        openMenuId,
        handleMenuOpen,
        handleMenuClose,
    } = useReviewList();
    const isExpanded = expandedId === review.id;
    const menuOpen = openMenuId === review.id;

    const { getAccessTokenSilently } = useAuth0();
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = () => handleMenuClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuOpen]);

    const handleDelete = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw new Error("Failed to delete");
            onReviewDeleted();
        } catch (err) {
            console.error(err);
        }
        setConfirmOpen(false);
    };

    return (
        <motion.div
            id={`review-${review.id}`}
            initial={{ opacity: 0 }}
            animate={
                isNew
                    ? {
                          opacity: 1,
                          scale: 1.05,
                          boxShadow: glowShadow,
                      }
                    : {
                          opacity: 1,
                      }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={themeStyle}
            className="bg-surface-50 rounded-2xl shadow-md border border-surface-200 border-l-4 border-l-secondary-400 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-text-dark">
                        {review.restaurant_name}
                    </h3>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <span className="text-sm text-text-light whitespace-nowrap">
                            {new Date(review.visit_date).toLocaleDateString()}
                        </span>
                        <Avatar
                            name={review.reviewer_name}
                            picture={review.reviewer_picture}
                            size="sm"
                        />
                        {currentUserId === review.user_id && (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        menuOpen
                                            ? handleMenuClose()
                                            : handleMenuOpen(review.id);
                                    }}
                                    className="flex items-center text-text-light hover:text-text-mid cursor-pointer transition-colors"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                {menuOpen && (
                                    <div className="absolute right-0 top-6 bg-surface-50 border border-surface-200 rounded-lg shadow-lg z-20 w-36">
                                        <button
                                            onClick={() => {
                                                handleMenuClose();
                                                setConfirmOpen(true);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-primary-600 hover:bg-surface-100 rounded-lg cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                            {text.delete}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {review.image_urls && review.image_urls.length > 0 && (
                <div className="px-6 pb-4">
                    <div
                        className="rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => handleExpand(review.id)}
                    >
                        {isExpanded ? (
                            <ImageCarousel images={review.image_urls} />
                        ) : (
                            <div
                                className="w-full h-16 rounded-xl bg-cover bg-center flex items-center justify-center"
                                style={{
                                    backgroundImage: `url(${review.image_urls[0]})`,
                                }}
                            >
                                <span className="bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                                    {text.photoCount(review.image_urls.length)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(review.food_rating ||
                review.drink_rating ||
                review.ambience_rating) && (
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {review.food_rating && (
                            <RatingField
                                label={text.foodLabel}
                                value={review.food_rating}
                                readOnly
                                size={size}
                            />
                        )}
                        {review.drink_rating && (
                            <RatingField
                                label={text.drinksLabel}
                                value={review.drink_rating}
                                readOnly
                                size={size}
                            />
                        )}
                        {review.ambience_rating && (
                            <RatingField
                                label={text.ambienceLabel}
                                value={review.ambience_rating}
                                readOnly
                                size={size}
                            />
                        )}
                    </div>
                </div>
            )}

            {review.review_text && (
                <>
                    <div className="border-t border-surface-200 mx-6" />
                    <div className="px-6 py-4">
                        <p className="text-text-mid text-sm leading-relaxed">
                            {review.review_text}
                        </p>
                    </div>
                </>
            )}
            <ConfirmModal
                isOpen={confirmOpen}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                message={text.confirmDeleteReview}
            />
        </motion.div>
    );
}

export default ReviewCard;
