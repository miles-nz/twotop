import StarRating from "../ui/StarRating";

function ReviewCardRatings({
    foodRating,
    drinkRating,
    ambienceRating,
    foodEmoji,
    drinkEmoji,
    ambienceEmoji,
}) {
    if (!foodRating && !drinkRating && !ambienceRating) return null;

    return (
        <div className="px-6 pb-4 overflow-x-auto">
            <div className="flex gap-4 w-fit mx-auto">
                {foodRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>{foodEmoji || text.defaultFoodEmoji}</span>
                        <StarRating value={foodRating} readOnly size="xs" />
                    </span>
                )}
                {drinkRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>{drinkEmoji || text.defaultDrinkEmoji}</span>
                        <StarRating value={drinkRating} readOnly size="xs" />
                    </span>
                )}
                {ambienceRating && (
                    <span className="flex items-center gap-1 text-sm text-text-mid">
                        <span>
                            {ambienceEmoji || text.defaultAmbienceEmoji}
                        </span>
                        <StarRating value={ambienceRating} readOnly size="xs" />
                    </span>
                )}
            </div>
        </div>
    );
}

export default ReviewCardRatings;
