import { useState } from "react";
import { motion } from "framer-motion";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import { useDarkMode } from "../../hooks/useDarkMode";
import Avatar from "../ui/Avatar";
import EditReviewUI from "./EditReviewUI";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import { themes } from "../../themes";
import ReactMarkdown from "react-markdown";
import { Quote } from "lucide-react";

const glowShadow = "0 0 10px var(--color-primary-500)";

function ReviewCard({ review, isNew, currentUserId, onReviewUpdated }) {
    const isDarkMode = useDarkMode();
    const themeSet = isDarkMode ? themes.dark : themes.light;
    const theme = themeSet[review.user_id] || {};
    const themeStyle = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [key, value]),
    );

    const [editing, setEditing] = useState(false);

    const {
        editedName,
        setEditedName,
        handleSaveName,
        editedReviewText,
        setEditedReviewText,
        editedFoodRating,
        setEditedFoodRating,
        editedDrinkRating,
        setEditedDrinkRating,
        editedAmbienceRating,
        setEditedAmbienceRating,
        editedFoodEmoji,
        setEditedFoodEmoji,
        editedDrinkEmoji,
        setEditedDrinkEmoji,
        editedAmbienceEmoji,
        setEditedAmbienceEmoji,
        editedVisitDate,
        setEditedVisitDate,
        handleSaveReview,
        addPhotoImages,
        setAddPhotoImages,
        removedPhotoUrls,
        setRemovedPhotoUrls,
        handleRemoveExistingPhoto,
        handleSavePhotos,
        saving,
    } = useReviewCardEditing(review, onReviewUpdated);

    return (
        <motion.div
            id={`review-${review.id}`}
            initial={{ opacity: 0 }}
            animate={
                isNew
                    ? {
                          opacity: 1,
                          scale: 1.01,
                          boxShadow: glowShadow,
                      }
                    : {
                          opacity: 1,
                      }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={themeStyle}
            className="bg-surface-50 rounded-2xl shadow-sm border border-surface-200 border-l-3 border-l-secondary-400 overflow-hidden transition-transform duration-200 hover:-translate-y-0.25 hover:shadow-md"
        >
            {editing ? (
                <EditReviewUI
                    editedName={editedName}
                    setEditedName={setEditedName}
                    editedFoodRating={editedFoodRating}
                    setEditedFoodRating={setEditedFoodRating}
                    editedDrinkRating={editedDrinkRating}
                    setEditedDrinkRating={setEditedDrinkRating}
                    editedAmbienceRating={editedAmbienceRating}
                    setEditedAmbienceRating={setEditedAmbienceRating}
                    editedVisitDate={editedVisitDate}
                    setEditedVisitDate={setEditedVisitDate}
                    editedReviewText={editedReviewText}
                    setEditedReviewText={setEditedReviewText}
                    editedFoodEmoji={editedFoodEmoji}
                    setEditedFoodEmoji={setEditedFoodEmoji}
                    editedDrinkEmoji={editedDrinkEmoji}
                    setEditedDrinkEmoji={setEditedDrinkEmoji}
                    editedAmbienceEmoji={editedAmbienceEmoji}
                    setEditedAmbienceEmoji={setEditedAmbienceEmoji}
                    addPhotoImages={addPhotoImages}
                    setAddPhotoImages={setAddPhotoImages}
                    removedPhotoUrls={removedPhotoUrls}
                    setRemovedPhotoUrls={setRemovedPhotoUrls}
                    handleRemoveExistingPhoto={handleRemoveExistingPhoto}
                    handleSave={async (isPublic) => {
                        await handleSaveReview(isPublic);
                        setEditing(false);
                    }}
                    onClose={() => setEditing(false)}
                    review={review}
                />
            ) : (
                <div className="py-6">
                    <div className="px-6 pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-2xl font-bold text-text-dark hyphens-auto break-words leading-tight">
                                    {review.restaurant_name}
                                </h3>
                                <span className="text-xs text-text-light tracking-wide mt-0.5">
                                    {new Date(
                                        review.visit_date,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                {currentUserId === review.user_id && (
                                    <ReviewCardMenu
                                        review={review}
                                        onAddPhotos={() => setEditing(true)}
                                        onEditReview={() => setEditing(true)}
                                        onEditName={() => setEditing(true)}
                                        onReviewUpdated={onReviewUpdated}
                                    />
                                )}
                                <Avatar
                                    name={review.reviewer_name}
                                    picture={review.reviewer_picture}
                                    size="md"
                                    title={review.reviewer_name}
                                />
                            </div>
                        </div>
                    </div>
                    {(review.food_rating ||
                        review.drink_rating ||
                        review.ambience_rating) && (
                        <div className="mt-2 flex justify-start lg:justify-center">
                            <ReviewCardRatings
                                foodRating={review.food_rating}
                                drinkRating={review.drink_rating}
                                ambienceRating={review.ambience_rating}
                                foodEmoji={review.food_emoji}
                                drinkEmoji={review.drink_emoji}
                                ambienceEmoji={review.ambience_emoji}
                            />
                        </div>
                    )}
                    {review.image_urls && review.image_urls.length > 0 && (
                        <div className="flex justify-center w-full px-4 pt-2">
                            <div className="w-full max-w-xl aspect-square rounded-2xl overflow-hidden">
                                <ReviewCardCarousel
                                    images={review.image_urls}
                                    reviewId={review.id}
                                    className="rounded-2xl"
                                />
                            </div>
                        </div>
                    )}
                    {/* Divider if no photos and there is review text */}
                    {(!review.image_urls || review.image_urls.length === 0) &&
                        review.review_text && (
                            <div className="border-t border-surface-200 mx-6" />
                        )}
                    {review.review_text && (
                        <div className="px-6 pt-3">
                            <div className="text-text-mid text-sm leading-normal hyphens-auto break-words">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => (
                                            <p className="mb-2 last:mb-0">
                                                {children}
                                            </p>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic">
                                                {children}
                                            </em>
                                        ),
                                        blockquote: ({ children }) => (
                                            <div className="flex gap-1">
                                                <Quote
                                                    size={50}
                                                    className="fill-current"
                                                />
                                                <blockquote className="pl-3 border-l-0 text-text-light italic">
                                                    {children}
                                                </blockquote>
                                            </div>
                                        ),
                                    }}
                                >
                                    {review.review_text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <LoadingOverlay isVisible={saving} />
        </motion.div>
    );
}

export default ReviewCard;
