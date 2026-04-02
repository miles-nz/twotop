import StarRating from "../ui/StarRating";
import { useBreakpoint } from "../../hooks/useBreakpoint";

function ReviewCardRatings({ foodRating, drinkRating, ambienceRating }) {
    const isDesktop = useBreakpoint();

    if (!foodRating && !drinkRating && !ambienceRating) return null;

    return (
        <div className="px-6 pt-1 pb-4 sm:py-0 sm:pb-4 overflow-x-auto mx-auto">
            <div
                className={
                    isDesktop
                        ? "flex w-full justify-between items-center"
                        : "flex flex-col w-full gap-4"
                }
            >
                {/* Food Rating */}
                {foodRating && (
                    <span
                        className={
                            isDesktop
                                ? "flex flex-col items-center gap-1"
                                : "flex flex-row items-center gap-4 w-full"
                        }
                        title="Food"
                    >
                        <span
                            className={
                                isDesktop
                                    ? "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-left"
                                    : "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-center"
                            }
                        >
                            Food
                        </span>
                        <div
                            className={
                                isDesktop
                                    ? "flex items-center"
                                    : "flex-1 flex items-center justify-end"
                            }
                        >
                            <StarRating
                                value={foodRating}
                                readOnly
                                size={isDesktop ? "lg" : "md"}
                            />
                            {isDesktop && foodRating && drinkRating && (
                                <span
                                    className="mx-3 h-10 border-l border-surface-200"
                                    aria-hidden="true"
                                ></span>
                            )}
                        </div>
                    </span>
                )}
                {/* Drink Rating */}
                {drinkRating && (
                    <span
                        className={
                            isDesktop
                                ? "flex flex-col items-center gap-1"
                                : "flex flex-row items-center gap-4 w-full"
                        }
                        title="Drink"
                    >
                        <span
                            className={
                                isDesktop
                                    ? "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-left"
                                    : "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-center"
                            }
                        >
                            Drink
                        </span>
                        <div
                            className={
                                isDesktop
                                    ? "flex items-center"
                                    : "flex-1 flex items-center justify-end"
                            }
                        >
                            <StarRating
                                value={drinkRating}
                                readOnly
                                size={isDesktop ? "lg" : "md"}
                            />
                            {isDesktop && drinkRating && ambienceRating && (
                                <span
                                    className="mx-3 h-10 border-l border-surface-200"
                                    aria-hidden="true"
                                ></span>
                            )}
                        </div>
                    </span>
                )}
                {/* Ambience Rating */}
                {ambienceRating && (
                    <span
                        className={
                            isDesktop
                                ? "flex flex-col items-center gap-1"
                                : "flex flex-row items-center gap-4 w-full"
                        }
                        title="Ambience"
                    >
                        <span
                            className={
                                isDesktop
                                    ? "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-left"
                                    : "text-xs sm:text-sm text-text-light tracking-wide min-w-[70px] text-center"
                            }
                        >
                            Ambience
                        </span>
                        <div
                            className={
                                isDesktop
                                    ? "flex items-center"
                                    : "flex-1 flex items-center justify-end"
                            }
                        >
                            <StarRating
                                value={ambienceRating}
                                readOnly
                                size={isDesktop ? "lg" : "md"}
                            />
                        </div>
                    </span>
                )}
            </div>
        </div>
    );
}

export default ReviewCardRatings;
