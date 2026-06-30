import { useState } from "react";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import EditReviewUI from "./EditReviewUI";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import { ReviewCardHeader, ReviewText } from "./reviewCardUtils";
import { text } from "../../resources";
import LinkedAvatar from "../ui/LinkedAvatar";

function SingleReviewCard({
    review,
    currentUserId,
    onReviewUpdated,
    isDetailPage = false,
}) {
    const [editing, setEditing] = useState(false);
    const editingState = useReviewCardEditing(review, onReviewUpdated, editing);
    const isOwner = review.user_id === currentUserId;

    const hasRatings =
        review.food_rating || review.drink_rating || review.ambience_rating;
    const hasImages = review.image_urls && review.image_urls.length > 0;

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
                        <LinkedAvatar
                            name={review.reviewer_name}
                            picture={review.reviewer_picture}
                            size="sm"
                            userId={review.user_id}
                            nameSide="left"
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

            {/* Images, ratings, and text */}
            <div
                className={`mx-6 mt-2 ${hasImages || hasRatings ? "pt-4" : ""}`}
            >
                {/* Images */}
                {hasImages && (
                    <div className="flex justify-center w-full pb-6">
                        <div className="w-full max-w-xl aspect-square rounded-2xl overflow-hidden">
                            <ReviewCardCarousel
                                images={review.image_urls}
                                lqips={review.image_lqips}
                                reviewId={review.id}
                            />
                        </div>
                    </div>
                )}
                {/* Ratings */}
                {hasRatings && (
                    <div className="flex justify-start lg:justify-center">
                        <ReviewCardRatings
                            foodRating={review.food_rating}
                            drinkRating={review.drink_rating}
                            ambienceRating={review.ambience_rating}
                        />
                    </div>
                )}
                {/* Divider */}
                {review.review_text && (
                    <div className="border-t border-surface-200 mt-3 mb-3" />
                )}
                {/* Review text */}
                <ReviewText className="pb-4">{review.review_text}</ReviewText>
            </div>
        </div>
    );
}

export default SingleReviewCard;
