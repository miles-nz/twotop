import { useState } from "react";
import { motion } from "framer-motion";
import { useReviewCardEditing } from "../../hooks/useReviewCardEditing";
import Avatar from "../ui/Avatar";
import EditReviewUI from "./EditReviewUI";
import LoadingOverlay from "../ui/LoadingOverlay";
import ReviewCardMenu from "./ReviewCardMenu";
import ReviewCardRatings from "./ReviewCardRatings";
import ReviewCardCarousel from "./ReviewCardCarousel";
import { themes } from "../../themes";
import ReactMarkdown from "react-markdown";
import { Quote, MapPin } from "lucide-react";
import rehypeRaw from "rehype-raw";
import {
    formatVisitDate,
    formatHoverDate,
    formatShortAddress,
} from "../../utils";
import { text } from "../../resources";

function ReviewCard({ review, currentUserId, onReviewUpdated, isDarkMode }) {
    const themeSet = isDarkMode ? themes.dark : themes.light;
    const theme = themeSet[review.user_id] || {};

    const [editing, setEditing] = useState(false);
    const editingState = useReviewCardEditing(review, onReviewUpdated, editing);

    return (
        <motion.div
            id={`review-${review.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={theme}
            className="bg-surface-50 rounded-2xl shadow-sm border border-surface-200 border-l-3 border-l-secondary-400 overflow-hidden transition-transform duration-200 hover:-translate-y-px hover:shadow-md"
        >
            {editing ? (
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
                    <div className="px-6 pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <h3 className="text-2xl font-bold text-text-dark wrap-break-word leading-tight">
                                    {review.restaurant_name}
                                </h3>
                                {review.restaurant_address ? (
                                    <span className="text-xs text-text-light wrap-break-word">
                                        <span>
                                            {review.place_id ? (
                                                <a
                                                    href={text.makeGoogleMapsLink(
                                                        review.restaurant_name,
                                                        review.place_id,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-text-mid transition-colors"
                                                >
                                                    <span className="hidden sm:inline">
                                                        <MapPin
                                                            size={11}
                                                            className="inline mr-0.5 mb-0.5"
                                                        />
                                                        {
                                                            review.restaurant_address
                                                        }
                                                    </span>
                                                    <span className="sm:hidden">
                                                        <MapPin
                                                            size={11}
                                                            className="inline mr-0.5 mb-0.5"
                                                        />
                                                        {formatShortAddress(
                                                            review.restaurant_address,
                                                        )}
                                                    </span>
                                                </a>
                                            ) : (
                                                <>
                                                    <span className="hidden sm:inline">
                                                        {
                                                            review.restaurant_address
                                                        }
                                                    </span>
                                                    <span className="sm:hidden">
                                                        {formatShortAddress(
                                                            review.restaurant_address,
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                        <span className="hidden sm:inline mx-1 text-text-light/35">
                                            |
                                        </span>
                                        <span
                                            title={formatHoverDate(
                                                review.visit_date,
                                            )}
                                            className="hidden sm:inline text-text-light"
                                        >
                                            {formatVisitDate(review.visit_date)}
                                        </span>
                                        <span
                                            title={formatHoverDate(
                                                review.visit_date,
                                            )}
                                            className="sm:hidden block text-text-light mt-0.5"
                                        >
                                            {formatVisitDate(review.visit_date)}
                                        </span>
                                    </span>
                                ) : (
                                    <span
                                        title={formatHoverDate(
                                            review.visit_date,
                                        )}
                                        className="text-xs text-text-light tracking-wide mt-0.5"
                                    >
                                        {formatVisitDate(review.visit_date)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    {review.reviewer_name && (
                                        <span className="text-sm text-text-mid">
                                            {review.reviewer_name}
                                        </span>
                                    )}
                                    <Avatar
                                        name={review.reviewer_name}
                                        picture={review.reviewer_picture}
                                        size="md"
                                        title={review.reviewer_name}
                                    />
                                </div>
                                {currentUserId === review.user_id && (
                                    <ReviewCardMenu
                                        review={review}
                                        onEditReview={() => setEditing(true)}
                                        onReviewUpdated={onReviewUpdated}
                                    />
                                )}
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
                    {(!review.image_urls || review.image_urls.length === 0) &&
                        review.review_text && (
                            <div className="border-t border-surface-200 mx-6" />
                        )}
                    {review.review_text && (
                        <div className="px-4 pt-3">
                            <div className="text-text-mid text-sm leading-normal wrap-break-word">
                                <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
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
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-text-dark">
                                                {children}
                                            </strong>
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
                                        ul: ({ children }) => (
                                            <ul className="list-disc pl-4 mb-2 space-y-1">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal pl-4 mb-2 space-y-1">
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="text-text-mid">
                                                {children}
                                            </li>
                                        ),
                                        caption: ({ children }) => (
                                            <p className="text-text-light text-[10px] sm:text-xs italic mb-3 text-center">
                                                {children}
                                            </p>
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
            <LoadingOverlay isVisible={editingState.saving} />
        </motion.div>
    );
}

export default ReviewCard;
