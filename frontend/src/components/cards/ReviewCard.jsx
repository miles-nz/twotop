import { useState } from "react";
import { motion } from "framer-motion";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import Avatar from "../ui/Avatar";
import EditNameUI from "./EditNameUI";
import EditPhotosUI from "./EditPhotosUI";
import EditReviewUI from "./EditReviewUI";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import { themes } from "../../themes";

const glowShadow = "0 0 10px var(--color-primary-500)";

function ReviewCard({ review, isNew, currentUserId, onReviewUpdated }) {
    const theme = themes[review.user_id] || {};
    const themeStyle = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [key, value]),
    );

    const [addingPhotos, setAddingPhotos] = useState(false);
    const [editingReview, setEditingReview] = useState(false);
    const [editingName, setEditingName] = useState(false);

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
            className="bg-surface-50 rounded-2xl shadow-md border border-surface-200 border-l-4 border-l-secondary-400 overflow-hidden transition-transform duration-200 hover:-translate-y-0.25 hover:shadow-lg"
        >
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-text-dark hyphens-auto break-words">
                            {editingName ? (
                                <EditNameUI
                                    editedName={editedName}
                                    setEditedName={setEditedName}
                                    handleSaveName={handleSaveName}
                                    onClose={() => setEditingName(false)}
                                />
                            ) : (
                                review.restaurant_name
                            )}
                        </h3>
                        <span className="text-sm text-text-light mt-1">
                            {new Date(review.visit_date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <Avatar
                            name={review.reviewer_name}
                            picture={review.reviewer_picture}
                            size="md"
                        />
                        {currentUserId === review.user_id && (
                            <ReviewCardMenu
                                review={review}
                                onAddPhotos={() => setAddingPhotos(true)}
                                onEditReview={() => setEditingReview(true)}
                                onEditName={() => setEditingName(true)}
                                onReviewUpdated={onReviewUpdated}
                            />
                        )}
                    </div>
                </div>
            </div>

            {(review.food_rating ||
                review.drink_rating ||
                review.ambience_rating ||
                editingReview) &&
                (editingReview ? (
                    <EditReviewUI
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
                        handleSaveReview={handleSaveReview}
                        onClose={() => setEditingReview(false)}
                    />
                ) : (
                    <ReviewCardRatings
                        foodRating={review.food_rating}
                        drinkRating={review.drink_rating}
                        ambienceRating={review.ambience_rating}
                        foodEmoji={review.food_emoji}
                        drinkEmoji={review.drink_emoji}
                        ambienceEmoji={review.ambience_emoji}
                    />
                ))}
            {!editingReview && (
                <>
                    {(review.review_text ||
                        (review.image_urls && review.image_urls.length > 0) ||
                        addingPhotos) && (
                        <div className="border-t border-surface-200 mx-6" />
                    )}
                    {addingPhotos && (
                        <EditPhotosUI
                            review={review}
                            addPhotoImages={addPhotoImages}
                            setAddPhotoImages={setAddPhotoImages}
                            removedPhotoUrls={removedPhotoUrls}
                            handleRemoveExistingPhoto={
                                handleRemoveExistingPhoto
                            }
                            handleSavePhotos={handleSavePhotos}
                            onClose={() => {
                                setAddingPhotos(false);
                                setAddPhotoImages([]);
                                setRemovedPhotoUrls([]);
                            }}
                        />
                    )}
                    {review.image_urls && review.image_urls.length > 0 && (
                        <ReviewCardCarousel
                            images={review.image_urls}
                            reviewId={review.id}
                        />
                    )}
                    {review.review_text && (
                        <div className="px-6 py-4">
                            <p className="text-text-mid text-sm leading-relaxed hyphens-auto break-words">
                                {review.review_text}
                            </p>
                        </div>
                    )}
                </>
            )}
            <LoadingOverlay isVisible={saving} />
        </motion.div>
    );
}

export default ReviewCard;
