import StarRating from "../ui/StarRating";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { text } from "../../resources";

function ReviewCardRatings({ foodRating, drinkRating, ambienceRating }) {
    const isDesktop = useBreakpoint("md");

    const spanClass = isDesktop
        ? "flex-1 flex flex-col items-center gap-1 border-r border-surface-200 last:border-r-0"
        : "flex flex-row items-center gap-4 w-full";

    const labelClass = isDesktop
        ? "text-xs sm:text-sm text-text-light tracking-wide"
        : "text-xs sm:text-sm text-text-light tracking-wide min-w-17.5 text-center";

    const starWrapperClass = isDesktop
        ? "flex items-center"
        : "flex-1 flex items-center justify-end";

    const ratings = [
        { label: text.foodLabel, value: foodRating },
        { label: text.drinkLabel, value: drinkRating },
        { label: text.ambienceLabel, value: ambienceRating },
    ].filter((r) => r.value);

    if (ratings.length === 0) return null;

    return (
        <div className="px-6 pt-1 pb-4 sm:py-0 sm:pb-4 overflow-x-auto mx-auto w-full">
            <div
                className={
                    isDesktop
                        ? "flex w-full items-center"
                        : "flex flex-col w-full gap-4"
                }
            >
                {ratings.map((r) => (
                    <span key={r.label} className={spanClass} title={r.label}>
                        <span className={labelClass}>{r.label}</span>
                        <div className={starWrapperClass}>
                            <StarRating
                                value={r.value}
                                readOnly
                                size={isDesktop ? "lg" : "md"}
                            />
                        </div>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default ReviewCardRatings;
