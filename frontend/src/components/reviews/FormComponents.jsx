import Avatar from "../ui/Avatar";
import RatingField from "./RatingField";
import { text } from "../../resources";

export function FormError({ error }) {
    if (!error) return null;
    const errors = Array.isArray(error) ? error : [error];
    return (
        <div className="bg-error-50 border border-error-200 rounded-lg p-3 mb-4">
            {errors.map((err, index) => (
                <p key={index} className="text-error-600 text-sm">
                    {err}
                </p>
            ))}
        </div>
    );
}

export function RatingsFields({
    foodRating,
    setFoodRating,
    drinkRating,
    setDrinkRating,
    ambienceRating,
    setAmbienceRating,
    size = "sm",
}) {
    return (
        <>
            {/* Mobile: vertical stack */}
            <div className="sm:hidden bg-surface-100 border border-surface-200 rounded-lg divide-y divide-surface-200">
                <RatingField
                    label={
                        <span className="flex items-center gap-1">
                            {text.foodLabel}
                        </span>
                    }
                    value={foodRating}
                    onChange={setFoodRating}
                    size="md"
                />
                <RatingField
                    label={
                        <span className="flex items-center gap-1">
                            {text.drinkLabel}
                        </span>
                    }
                    value={drinkRating}
                    onChange={setDrinkRating}
                    size="md"
                />
                <RatingField
                    label={
                        <span className="flex items-center gap-1">
                            {text.ambienceLabel}
                        </span>
                    }
                    value={ambienceRating}
                    onChange={setAmbienceRating}
                    size="md"
                />
            </div>
            {/* Desktop: horizontal joined */}
            <div className="hidden sm:grid grid-cols-3 bg-surface-100 border border-surface-200 rounded-lg overflow-hidden">
                <RatingField
                    label={
                        <span className="flex items-center justify-center gap-1">
                            {text.foodLabel}
                        </span>
                    }
                    value={foodRating}
                    onChange={setFoodRating}
                    size={size}
                />
                <div className="border-l border-surface-200">
                    <RatingField
                        label={
                            <span className="flex items-center justify-center gap-1">
                                {text.drinkLabel}
                            </span>
                        }
                        value={drinkRating}
                        onChange={setDrinkRating}
                        size={size}
                    />
                </div>
                <div className="border-l border-surface-200">
                    <RatingField
                        label={
                            <span className="flex items-center justify-center gap-1">
                                {text.ambienceLabel}
                            </span>
                        }
                        value={ambienceRating}
                        onChange={setAmbienceRating}
                        size={size}
                    />
                </div>
            </div>
        </>
    );
}

export function ContributorPicker({
    sharedWith,
    selectedContributors,
    onToggle,
}) {
    if (!sharedWith.length) {
        return (
            <p className="text-xs text-text-light italic">
                {text.noSharedWithForCollaboration}
            </p>
        );
    }
    return (
        <div className="flex flex-col gap-2">
            {sharedWith.map((person) => {
                const selected = selectedContributors.some(
                    (c) => c.user_id === person.user_id,
                );
                return (
                    <button
                        key={person.user_id}
                        onClick={() => onToggle(person)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                            selected
                                ? "bg-secondary-100 border border-secondary-300"
                                : "bg-surface-50 border border-surface-200 hover:bg-surface-100"
                        }`}
                    >
                        <Avatar
                            name={person.name}
                            picture={person.picture}
                            size="sm"
                        />
                        <span className="text-sm text-text-dark">
                            {person.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
