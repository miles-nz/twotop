import StarRating from "../ui/StarRating";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { text } from "../../resources";

function ReviewCardRatings({
    foodRating,
    drinkRating,
    ambienceRating,
    foodEmoji,
    drinkEmoji,
    ambienceEmoji,
}) {
    const isDesktop = useBreakpoint();

    if (!foodRating && !drinkRating && !ambienceRating) return null;

    return (
        <div className="px-6 pt-1 pb-4 sm:py-0 sm:pb-4 overflow-x-auto">
            <div className="flex gap-3">
                {foodRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>{foodEmoji || text.defaultFoodEmoji}</span>
                        <StarRating
                            value={foodRating}
                            readOnly
                            size={isDesktop ? "sm" : "xs"}
                        />
                    </span>
                )}
                {drinkRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>{drinkEmoji || text.defaultDrinkEmoji}</span>
                        <StarRating
                            value={drinkRating}
                            readOnly
                            size={isDesktop ? "sm" : "xs"}
                        />
                    </span>
                )}
                {ambienceRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>
                            {ambienceEmoji || text.defaultAmbienceEmoji}
                        </span>
                        <StarRating
                            value={ambienceRating}
                            readOnly
                            size={isDesktop ? "sm" : "xs"}
                        />
                    </span>
                )}
            </div>
        </div>
    );
}

export default ReviewCardRatings;
