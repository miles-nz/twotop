import StarRating from "./StarRating";

function RatingField({
    label,
    value,
    onChange,
    readOnly = false,
    size = "md",
}) {
    return (
        <div className="bg-surface-100 rounded-lg p-3 text-center border border-surface-200">
            <p className="text-xs text-text-light mb-2">{label}</p>
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
