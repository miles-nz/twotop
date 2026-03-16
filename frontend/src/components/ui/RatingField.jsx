import StarRating from "./StarRating";

function RatingField({
    label,
    value,
    onChange,
    readOnly = false,
    size = "md",
}) {
    return (
        <div className="rounded-lg p-2 sm:p-3 text-center sm:bg-surface-100 sm:border sm:border-surface-200">
            <p className="text-xs text-text-light mb-1">{label}</p>
            <div className="flex justify-center">
                <StarRating
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    size={size}
                />
            </div>
        </div>
    );
}

export default RatingField;
