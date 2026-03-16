import { useState, useRef, useEffect } from "react";

function StarRating({ value, onChange, readOnly = false, size = "md" }) {
    const containerRef = useRef(null);
    const sizes = {
        xxs: "w-3 h-3",
        xs: "w-4 h-4",
        sm: "w-7 h-7",
        md: "w-8 h-8",
    };
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

    const handleTouchMove = (e) => {
        if (readOnly) return;
        e.preventDefault();
        const touch = e.touches[0];
        const stars = containerRef.current.querySelectorAll("[data-star]");

        for (const star of stars) {
            const rect = star.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
                const x = touch.clientX - rect.left;
                const isLeftHalf = x < rect.width / 2;
                const starIndex = parseInt(star.dataset.star);
                setHoverValue(isLeftHalf ? starIndex - 0.5 : starIndex);
                break;
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (readOnly) return;
        if (hoverValue !== null) {
            onChange(hoverValue);
            setHoverValue(null);
        }
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("touchmove", handleTouchMove, { passive: false });
        return () => el.removeEventListener("touchmove", handleTouchMove);
    }, [hoverValue]);

    return (
        <div
            ref={containerRef}
            className="flex gap-1"
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onTouchEnd={handleTouchEnd}
        >
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const fill = getStarFill(starIndex);
                return (
                    <div
                        key={starIndex}
                        data-star={starIndex}
                        className={`relative ${readOnly ? "cursor-default" : "cursor-pointer"} ${sizes[size]}`}
                        onMouseMove={(e) => handleMouseMove(e, starIndex)}
                        onClick={(e) => handleClick(e, starIndex)}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="absolute inset-0 w-full h-full text-surface-300"
                            fill="currentColor"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {fill !== "empty" && (
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{
                                    width: fill === "half" ? "50%" : "100%",
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className={`absolute inset-0 ${sizes[size]} text-secondary-400`}
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
