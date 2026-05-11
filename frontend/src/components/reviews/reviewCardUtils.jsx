import { Quote, MapPin, Share, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import {
    formatVisitDate,
    formatHoverDate,
    formatShortAddress,
    getOS,
} from "../../utils";
import { text } from "../../resources";

/**
 * Shared ReactMarkdown components config used by all review card variants.
 */
export const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    em: ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => (
        <strong className="font-semibold text-text-dark">{children}</strong>
    ),
    blockquote: ({ children }) => (
        <div className="flex gap-1">
            <Quote size={50} className="fill-current text-primary-500" />
            <blockquote className="pl-3 border-l-0 text-text-light italic">
                {children}
            </blockquote>
        </div>
    ),
    ul: ({ children }) => (
        <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => <li className="text-text-mid">{children}</li>,
    caption: ({ children }) => (
        <p className="text-text-light text-[10px] sm:text-xs italic mb-3 text-center">
            {children}
        </p>
    ),
};

/**
 * Shared restaurant name, address, and date header used by all review card variants.
 */
export function ReviewCardHeader({ review, isDetailPage = false }) {
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-2xl font-bold text-text-dark wrap-break-word leading-tight">
                {isDetailPage ? (
                    review.restaurant_name
                ) : (
                    <Link
                        to={`/reviews/${review.id}`}
                        className="hover:text-text-mid transition-colors"
                    >
                        {review.restaurant_name}
                    </Link>
                )}
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
                                    {review.restaurant_address}
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
                                    {review.restaurant_address}
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
                    {isDetailPage ? (
                        <>
                            <span
                                title={formatHoverDate(review.visit_date)}
                                className="hidden sm:inline text-text-light"
                            >
                                {formatVisitDate(review.visit_date)}
                            </span>
                            <span
                                title={formatHoverDate(review.visit_date)}
                                className="sm:hidden block text-text-light mt-0.5"
                            >
                                {formatVisitDate(review.visit_date)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span
                                title={formatHoverDate(review.visit_date)}
                                className="hidden sm:inline text-text-light"
                            >
                                {formatVisitDate(review.visit_date)}
                            </span>
                            <span
                                title={formatHoverDate(review.visit_date)}
                                className="sm:hidden block text-text-light mt-0.5"
                            >
                                {formatVisitDate(review.visit_date)}
                            </span>
                        </>
                    )}
                </span>
            ) : isDetailPage ? (
                <span
                    title={formatHoverDate(review.visit_date)}
                    className="text-xs text-text-light tracking-wide mt-0.5"
                >
                    {formatVisitDate(review.visit_date)}
                </span>
            ) : (
                <span
                    title={formatHoverDate(review.visit_date)}
                    className="text-xs text-text-light tracking-wide mt-0.5"
                >
                    {formatVisitDate(review.visit_date)}
                </span>
            )}
        </div>
    );
}

/**
 * Renders markdown review text with consistent styling.
 * className is applied to the outer wrapper for layout-specific padding/margin.
 */
export function ReviewText({ children, className = "px-4 pt-3 pb-0" }) {
    if (!children) return null;
    return (
        <div className={className}>
            <div className="text-text-mid text-sm leading-normal wrap-break-word">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                >
                    {children}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export function ShareReviewButton({ reviewId }) {
    const url = `${window.location.origin}/reviews/${reviewId}`;
    const isIos = ["ios", "macos"].includes(getOS());

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ url });
            } catch {
                // user cancelled, do nothing
            }
        } else {
            await navigator.clipboard.writeText(url);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="text-text-light hover:text-text-mid transition-colors cursor-pointer"
            aria-label="Share review"
        >
            {isIos ? <Share size={16} /> : <Share2 size={16} />}
        </button>
    );
}
