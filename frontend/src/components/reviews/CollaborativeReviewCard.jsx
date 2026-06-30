import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { createPortal } from "react-dom";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import CollaboratorAvatars from "./CollaboratorAvatars";
import { buildInterleavedGallery } from "./reviewCardUtils";
import EditReviewUI from "./EditReviewUI";
import ContributorForm from "./ContributorForm";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import ConfirmModal from "../ui/ConfirmModal";
import LinkedAvatar from "../ui/LinkedAvatar";
import { MoreHorizontal, Pencil, LogOut, Share, Share2 } from "lucide-react";
import { text } from "../../resources";
import { ReviewCardHeader, ReviewText } from "./reviewCardUtils";
import { useReviewList } from "../../contexts/ReviewListContext";
import { getOS } from "../../utils";

function ContributorMenu({ review, onEdit, onReviewUpdated }) {
    const { getAccessTokenSilently } = useAuth0();
    const { openMenuId, handleMenuOpen, handleMenuClose } = useReviewList();
    const menuId = `contributor-${review.id}`;
    const menuOpen = openMenuId === menuId;
    const buttonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const handleOpenMenu = (e) => {
        e.stopPropagation();
        if (!menuOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({ top: rect.bottom, left: rect.right - 192 });
        }
        menuOpen ? handleMenuClose() : handleMenuOpen(menuId);
    };

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = () => handleMenuClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect)
                setMenuPosition({ top: rect.bottom, left: rect.right - 192 });
        };
        window.addEventListener("scroll", updatePosition);
        return () => window.removeEventListener("scroll", updatePosition);
    }, [menuOpen]);

    const handleLeave = async () => {
        setLeaving(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}/contributions`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw new Error("Failed to leave");
            onReviewUpdated(review.id);
        } catch (err) {
            console.error(err);
        } finally {
            setLeaving(false);
            setLeaveConfirmOpen(false);
        }
    };

    const handleShare = async () => {
        handleMenuClose();
        const url = `${window.location.origin}/reviews/${review.id}`;
        if (navigator.share) {
            try {
                await navigator.share({ url });
            } catch {
                // user cancelled
            }
        } else {
            await navigator.clipboard.writeText(url);
        }
    };

    const isIos = ["ios", "macos"].includes(getOS());
    const ShareIcon = isIos ? Share : Share2;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpenMenu}
                className="flex items-center text-text-light hover:text-text-mid transition-colors"
                aria-label={text.reviewCardMenu}
            >
                <MoreHorizontal size={18} />
            </button>
            {menuOpen &&
                createPortal(
                    <div
                        className="fixed bg-surface-50 border border-surface-200 rounded-lg shadow-lg z-40 w-48"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <button
                            onClick={() => {
                                handleMenuClose();
                                onEdit();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 rounded-t-lg"
                        >
                            <Pencil size={14} />
                            {text.edit}
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100"
                        >
                            <ShareIcon size={14} />
                            {text.shareReview}
                        </button>
                        <button
                            onClick={() => {
                                handleMenuClose();
                                setLeaveConfirmOpen(true);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error-600 hover:bg-surface-100 rounded-b-lg"
                        >
                            <LogOut size={14} />
                            {text.leaveCollaboration}
                        </button>
                    </div>,
                    document.body,
                )}
            <ConfirmModal
                isOpen={leaveConfirmOpen}
                onConfirm={handleLeave}
                onCancel={() => setLeaveConfirmOpen(false)}
                message={text.confirmLeaveCollaboration}
                loading={leaving}
                confirmLabel={text.leaveCollaboration}
            />
            <LoadingOverlay isVisible={leaving} />
        </div>
    );
}

function ReviewerSection({ review }) {
    const hasRatings =
        review.food_rating || review.drink_rating || review.ambience_rating;
    return (
        <div className="mx-6 mt-2 pt-4">
            <LinkedAvatar
                name={review.reviewer_name}
                picture={review.reviewer_picture}
                size="sm"
                userId={review.user_id}
                className="mb-2"
            />
            {hasRatings && (
                <div className="flex justify-start lg:justify-center">
                    <ReviewCardRatings
                        foodRating={review.food_rating}
                        drinkRating={review.drink_rating}
                        ambienceRating={review.ambience_rating}
                    />
                </div>
            )}
            {review.review_text && (
                <div className="border-t border-surface-200 mt-3 mb-3" />
            )}
            <ReviewText className="pb-4">{review.review_text}</ReviewText>
        </div>
    );
}

function ContributionSection({
    contribution,
    review,
    onReviewUpdated,
    currentUserId,
}) {
    const [editing, setEditing] = useState(false);
    const isOwn = contribution.user_id === currentUserId;
    const hasRatings =
        contribution.food_rating ||
        contribution.drink_rating ||
        contribution.ambience_rating;

    return (
        <div className="mx-6 mt-2 pt-4">
            <div className="flex items-center justify-between mb-2">
                <LinkedAvatar
                    name={contribution.reviewer_name}
                    picture={contribution.reviewer_picture}
                    size="sm"
                    userId={contribution.user_id}
                />
                {isOwn && (
                    <ContributorMenu
                        review={review}
                        onEdit={() => setEditing(true)}
                        onReviewUpdated={onReviewUpdated}
                    />
                )}
            </div>
            {editing ? (
                <ContributorForm
                    review={review}
                    existingContribution={contribution}
                    onSaved={() => {
                        setEditing(false);
                        onReviewUpdated(review.id);
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <div className="pb-4">
                    {hasRatings && (
                        <div className="flex justify-start lg:justify-center">
                            <ReviewCardRatings
                                foodRating={contribution.food_rating}
                                drinkRating={contribution.drink_rating}
                                ambienceRating={contribution.ambience_rating}
                            />
                        </div>
                    )}
                    {contribution.review_text && (
                        <div className="border-t border-surface-200 mt-3 mb-3" />
                    )}
                    <ReviewText className="pb-0">
                        {contribution.review_text}
                    </ReviewText>
                </div>
            )}
        </div>
    );
}

function CollaborativeReviewCard({
    review,
    currentUserId,
    onReviewUpdated,
    isDetailPage = false,
}) {
    const [editing, setEditing] = useState(false);
    const [addingContribution, setAddingContribution] = useState(false);
    const editingState = useReviewCardEditing(review, onReviewUpdated, editing);

    const isOwner = review.user_id === currentUserId;
    const isContributor =
        !isOwner &&
        (review.allowed_contributors || []).some(
            (c) => c.user_id === currentUserId,
        );

    const visibleContributions = (review.contributions || []).filter((c) =>
        (review.allowed_contributors || []).some(
            (ac) => ac.user_id === c.user_id,
        ),
    );

    const hasContributed = visibleContributions.some(
        (c) => c.user_id === currentUserId,
    );

    const {
        images: galleryImages,
        lqips: galleryLqips,
        labels: galleryLabels,
    } = buildInterleavedGallery(review, visibleContributions);

    if (editing) {
        return (
            <EditReviewUI
                editingState={editingState}
                handleSave={async (isPublic) => {
                    await editingState.handleSaveReview(isPublic);
                    setEditing(false);
                }}
                onClose={() => setEditing(false)}
                review={review}
            />
        );
    }

    return (
        <div className="py-6">
            <div className="px-6 pb-3">
                <div className="flex items-start justify-between">
                    <ReviewCardHeader
                        review={review}
                        isDetailPage={isDetailPage}
                    />
                    <div className="flex items-center gap-2 ml-3 mt-1 shrink-0">
                        {visibleContributions.length > 0 ? (
                            <CollaboratorAvatars
                                owner={{
                                    name: review.reviewer_name,
                                    picture: review.reviewer_picture,
                                    user_id: review.user_id,
                                }}
                                contributors={visibleContributions.map((c) => ({
                                    name: c.reviewer_name,
                                    picture: c.reviewer_picture,
                                    user_id: c.user_id,
                                }))}
                            />
                        ) : (
                            <LinkedAvatar
                                name={review.reviewer_name}
                                picture={review.reviewer_picture}
                                size="sm"
                                userId={review.user_id}
                                nameSide="left"
                            />
                        )}
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

            {galleryImages.length > 0 && (
                <div className="flex justify-center w-full px-4 py-3">
                    <div className="w-full max-w-xl aspect-square rounded-2xl overflow-hidden">
                        <ReviewCardCarousel
                            images={galleryImages}
                            lqips={galleryLqips}
                            labels={galleryLabels}
                            reviewId={review.id}
                        />
                    </div>
                </div>
            )}

            <ReviewerSection review={review} />

            {visibleContributions.map((contribution) => (
                <ContributionSection
                    key={contribution.user_id}
                    contribution={contribution}
                    review={review}
                    onReviewUpdated={onReviewUpdated}
                    currentUserId={currentUserId}
                />
            ))}

            {isContributor &&
                !hasContributed &&
                (addingContribution ? (
                    <div className="mx-6 mt-2 pt-4">
                        <div className="bg-surface-100/50 border border-surface-200 rounded-xl overflow-hidden">
                            <ContributorForm
                                review={review}
                                onSaved={() => {
                                    setAddingContribution(false);
                                    onReviewUpdated(review.id);
                                }}
                                onCancel={() => setAddingContribution(false)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mx-6 pb-0 pt-4 flex justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs text-text-mid italic mr-2">
                                {text.addYourReviewLabel}
                            </span>
                            <button
                                onClick={() => setAddingContribution(true)}
                                className="text-sm bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-1.5 rounded-lg transition-colors"
                            >
                                {text.addYourReviewButtonLabel}
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default CollaborativeReviewCard;
