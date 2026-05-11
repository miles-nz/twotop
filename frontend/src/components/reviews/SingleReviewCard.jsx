import { useState } from "react";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import Avatar from "../ui/Avatar";
import EditReviewUI from "./EditReviewUI";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import { ReviewCardHeader, ReviewText } from "./reviewCardUtils";

function SingleReviewCard({
    review,
    currentUserId,
    onReviewUpdated,
    isDetailPage = false,
}) {
    const [editing, setEditing] = useState(false);
    const editingState = useReviewCardEditing(review, onReviewUpdated, editing);
    const isOwner = review.user_id === currentUserId;

    return editing ? (
        <EditReviewUI
            editingState={editingState}
            handleSave={async (isPublic) => {
                await editingState.handleSaveReview(isPublic);
                setEditing(false);
            }}
            onClose={() => setEditing(false)}
            review={review}
        />
    ) : (
        <div className="py-6">
            {/* Header */}
            <div className="px-6 pb-3">
                <div className="flex items-start justify-between">
                    <ReviewCardHeader
                        review={review}
                        isDetailPage={isDetailPage}
                    />
                    <div className="flex items-center gap-2 ml-3 mt-1 shrink-0">
                        {review.reviewer_name && (
                            <span className="text-xs text-text-mid">
                                {review.reviewer_name}
                            </span>
                        )}
                        <Avatar
                            name={review.reviewer_name}
                            picture={review.reviewer_picture}
                            size="sm"
                            title={review.reviewer_name}
                        />
                        {isOwner && (
                            <ReviewCardMenu
                                review={review}
                                onEditReview={() => setEditing(true)}
                                onReviewUpdated={onReviewUpdated}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Ratings */}
            {(review.food_rating ||
                review.drink_rating ||
                review.ambience_rating) && (
                <div className="mt-2 flex justify-start lg:justify-center">
                    <ReviewCardRatings
                        foodRating={review.food_rating}
                        drinkRating={review.drink_rating}
                        ambienceRating={review.ambience_rating}
                    />
                </div>
            )}

            {/* Images */}
            {review.image_urls && review.image_urls.length > 0 && (
                <div className="flex justify-center w-full px-4 pt-2">
                    <div className="w-full max-w-xl aspect-square rounded-2xl overflow-hidden">
                        <ReviewCardCarousel
                            images={review.image_urls}
                            lqips={review.image_lqips}
                            reviewId={review.id}
                        />
                    </div>
                </div>
            )}

            {/* Divider before text if no images */}
            {(!review.image_urls || review.image_urls.length === 0) &&
                review.review_text && (
                    <div className="border-t border-surface-200 mx-6" />
                )}

            {/* Review text */}
            <ReviewText>{review.review_text}</ReviewText>
        </div>
    );
}

export default SingleReviewCard;
