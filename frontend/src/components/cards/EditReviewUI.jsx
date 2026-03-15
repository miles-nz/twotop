import { Check, X } from "lucide-react";
import RatingField from "../ui/RatingField";
import { text } from "../../resources";

function EditReviewUI({
    size,
    editedFoodRating,
    setEditedFoodRating,
    editedDrinkRating,
    setEditedDrinkRating,
    editedAmbienceRating,
    setEditedAmbienceRating,
    editedVisitDate,
    setEditedVisitDate,
    editedReviewText,
    setEditedReviewText,
    handleSaveReview,
    onClose,
}) {
    return (
        <>
            <div className="px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <RatingField
                        label={text.foodLabel}
                        value={editedFoodRating}
                        onChange={setEditedFoodRating}
                        size={size}
                    />
                    <RatingField
                        label={text.drinksLabel}
                        value={editedDrinkRating}
                        onChange={setEditedDrinkRating}
                        size={size}
                    />
                    <RatingField
                        label={text.ambienceLabel}
                        value={editedAmbienceRating}
                        onChange={setEditedAmbienceRating}
                        size={size}
                    />
                </div>
            </div>
            <div className="border-t border-surface-200 mx-6" />
            <div className="px-6 py-4">
                <div className="mb-3 pr-[26px] md:pr-0">
                    <input
                        type="date"
                        value={editedVisitDate}
                        onChange={(e) => setEditedVisitDate(e.target.value)}
                        className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark"
                    />
                </div>
                <textarea
                    value={editedReviewText}
                    onChange={(e) => setEditedReviewText(e.target.value)}
                    maxLength={2000}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 h-28 resize-none text-text-dark"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={onClose}
                        className="text-text-light hover:text-text-mid cursor-pointer transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={async () => {
                            await handleSaveReview();
                            onClose();
                        }}
                        className="text-secondary-500 hover:text-secondary-600 cursor-pointer transition-colors"
                    >
                        <Check size={18} />
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditReviewUI;
