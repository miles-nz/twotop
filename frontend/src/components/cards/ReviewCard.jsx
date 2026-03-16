import { useState } from "react";
import { motion } from "framer-motion";
import { useReviewList } from "../../contexts/ReviewListContext";
import { useCarousel } from "../../hooks/useCarousel";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import Avatar from "../ui/Avatar";
import ConfirmModal from "../modals/ConfirmModal";
import EditNameUI from "./EditNameUI";
import EditPhotosUI from "./EditPhotosUI";
import EditReviewUI from "./EditReviewUI";
import ImageCarousel from "./ImageCarousel";
import LoadingOverlay from "../ui/LoadingOverlay";
import RatingField from "../ui/RatingField";
import ReviewCardMenu from "./ReviewCardMenu";
import { themes } from "../../themes";
import { text } from "../../resources";

const glowShadow = "0 0 10px var(--color-primary-500)";

function ReviewCard({
    review,
    size = "md",
    isNew,
    currentUserId,
    onReviewUpdated,
}) {
    const theme = themes[review.user_id] || {};
    const themeStyle = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [key, value]),
    );

    const [addingPhotos, setAddingPhotos] = useState(false);
    const [editingReview, setEditingReview] = useState(false);
    const [editingName, setEditingName] = useState(false);

    const { expandedId, handleExpand } = useReviewList();
    const isExpanded = expandedId === review.id;

    const { carouselRef, expandedHeight, isCollapsed, setIsCollapsed } =
        useCarousel();

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
        editedVisitDate,
        setEditedVisitDate,
        handleSaveReview,
        addPhotoImages,
        setAddPhotoImages,
        removedPhotoUrls,
        setRemovedPhotoUrls,
        addPhotoInputRef,
        handleRemoveExistingPhoto,
        handleSavePhotos,
        deleting,
        handleDelete,
        confirmOpen,
        setConfirmOpen,
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
                    <h3 className="text-2xl font-bold text-text-dark hyphens-auto break-words">
                        {editingName ? (
                            <EditNameUI
                                editedName={editedName}
                                setEditedName={setEditedName}
                                handleSaveName={handleSaveName}
                                onClose={() => {
                                    setEditingName(false);
                                }}
                            />
                        ) : (
                            review.restaurant_name
                        )}
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
                            <ReviewCardMenu
                                review={review}
                                onAddPhotos={() => setAddingPhotos(true)}
                                onEditReview={() => setEditingReview(true)}
                                onEditName={() => setEditingName(true)}
                                onDelete={() => setConfirmOpen(true)}
                                onReviewUpdated={onReviewUpdated}
                            />
                        )}
                    </div>
                </div>
            </div>

            {addingPhotos && (
                <EditPhotosUI
                    review={review}
                    addPhotoImages={addPhotoImages}
                    setAddPhotoImages={setAddPhotoImages}
                    removedPhotoUrls={removedPhotoUrls}
                    addPhotoInputRef={addPhotoInputRef}
                    handleRemoveExistingPhoto={handleRemoveExistingPhoto}
                    handleSavePhotos={handleSavePhotos}
                    onClose={() => {
                        setAddingPhotos(false);
                        setAddPhotoImages([]);
                        setRemovedPhotoUrls([]);
                    }}
                />
            )}

            {review.image_urls && review.image_urls.length > 0 && (
                <div className="px-6 pb-4">
                    <div
                        ref={carouselRef}
                        className="rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => handleExpand(review.id)}
                    >
                        <motion.div
                            initial={{ height: 64 }}
                            animate={{
                                height: isExpanded ? expandedHeight : 64,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden relative"
                            onAnimationComplete={(definition) => {
                                if ("height" in definition)
                                    setIsCollapsed(!isExpanded);
                            }}
                        >
                            <ImageCarousel images={review.image_urls} />
                            {isCollapsed && !isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <span className="bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                                        {text.photoCount(
                                            review.image_urls.length,
                                        )}
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}

            {(review.food_rating ||
                review.drink_rating ||
                review.ambience_rating ||
                review.review_text ||
                editingReview) &&
                (editingReview ? (
                    <EditReviewUI
                        size={size}
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
                        handleSaveReview={handleSaveReview}
                        onClose={() => setEditingReview(false)}
                    />
                ) : (
                    <>
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
                        {review.review_text && (
                            <>
                                <div className="border-t border-surface-200 mx-6" />
                                <div className="px-6 py-4">
                                    <p className="text-text-mid text-sm leading-relaxed hyphens-auto break-words">
                                        {review.review_text}
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                ))}
            <ConfirmModal
                isOpen={confirmOpen}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                message={text.confirmDeleteReview}
                deleting={deleting}
            />
            <LoadingOverlay isVisible={saving || deleting} />
        </motion.div>
    );
}

export default ReviewCard;
