import { useState } from "react";

function StarRating({ value, onChange, readOnly = false }) {
    const [hoverValue, setHoverValue] = useState(null);

    const getStarFill = (starIndex) => {
        const activeValue = hoverValue !== null ? hoverValue : value;

        if (!activeValue) return "empty";
        if (activeValue >= starIndex) return "full";
        if (activeValue >= starIndex - 0.5) return "half";
        return "empty";
    };

    const handleMouseMove = (e, starIndex) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeftHalf = x < rect.width / 2;
        setHoverValue(isLeftHalf ? starIndex - 0.5 : starIndex);
    };

    const handleClick = (e, starIndex) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeftHalf = x < rect.width / 2;
        onChange(isLeftHalf ? starIndex - 0.5 : starIndex);
    };

    return (
        <div
            className="flex gap-1"
            onMouseLeave={() => !readOnly && setHoverValue(null)}
        >
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const fill = getStarFill(starIndex);
                return (
                    <div
                        key={starIndex}
                        className={`relative ${readOnly ? "cursor-default" : "cursor-pointer"} w-8 h-8`}
                        onMouseMove={(e) => handleMouseMove(e, starIndex)}
                        onClick={(e) => handleClick(e, starIndex)}
                    >
                        {/* Empty star background */}
                        <svg
                            viewBox="0 0 24 24"
                            className="absolute inset-0 w-full h-full text-surface-300"
                            fill="currentColor"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>

                        {/* Filled star overlay */}
                        {fill !== "empty" && (
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{
                                    width: fill === "half" ? "50%" : "100%",
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="absolute inset-0 w-8 h-8 text-primary-400"
                                    fill="currentColor"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StarRating;
