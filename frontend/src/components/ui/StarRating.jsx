import { useState, useRef, useEffect } from "react";

function StarRating({ value, onChange, readOnly = false, size = "md" }) {
    const gradientIdBase = useRef(
        `star-gradient-${Math.random().toString(36).substring(2, 9)}`,
    ).current;
    const containerRef = useRef(null);

    const sizes = {
        xxs: "w-3 h-3",
        xs: "w-4 h-4",
        sm: "w-7 h-7",
        md: "w-8 h-8",
        lg: "w-9.5 h-9.5",
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
        setHoverValue(x < rect.width / 2 ? starIndex - 0.5 : starIndex);
    };

    const handleClick = (e, starIndex) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        onChange(x < rect.width / 2 ? starIndex - 0.5 : starIndex);
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

        const handleTouchMove = (e) => {
            if (readOnly) return;
            e.preventDefault();
            const touch = e.touches[0];
            const stars = el.querySelectorAll("[data-star]");
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

        el.addEventListener("touchmove", handleTouchMove, { passive: false });
        return () => el.removeEventListener("touchmove", handleTouchMove);
    }, [readOnly]);

    const handleStarKeyDown = (e, starIndex) => {
        if (readOnly) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0.5, (value || 0) - 0.5));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(5, (value || 0) + 0.5));
        } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            onChange(starIndex);
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex gap-1"
            role="radiogroup"
            aria-label="Star rating"
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onTouchEnd={handleTouchEnd}
        >
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const fill = getStarFill(starIndex);
                const gradientId = `${gradientIdBase}-${starIndex}`;
                return (
                    <div
                        key={starIndex}
                        data-star={starIndex}
                        className={`relative ${readOnly ? "cursor-default" : "cursor-pointer"} ${sizes[size]}`}
                        onMouseMove={(e) => handleMouseMove(e, starIndex)}
                        onClick={(e) => handleClick(e, starIndex)}
                        tabIndex={readOnly ? -1 : 0}
                        aria-label={`Set rating to ${starIndex} star${starIndex > 1 ? "s" : ""}`}
                        onKeyDown={(e) => handleStarKeyDown(e, starIndex)}
                        role="radio"
                        aria-checked={value === starIndex}
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
                                    className={`absolute inset-0 ${sizes[size]}`}
                                    fill={`url(#${gradientId})`}
                                >
                                    <defs>
                                        <linearGradient
                                            id={gradientId}
                                            x1="2"
                                            y1="2"
                                            x2="22"
                                            y2="22"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="var(--color-primary-400)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="50%"
                                                stopColor="var(--color-primary-400)"
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="70%"
                                                stopColor="var(--color-primary-400)"
                                                stopOpacity={0.5}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="var(--color-primary-400)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
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
