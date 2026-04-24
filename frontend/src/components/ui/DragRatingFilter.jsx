import { useRef, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { STAR_PATH, text } from "../../resources";

const STAR_COUNT = 5;

function getStarValue(e, containerRef) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = clientX - rect.left;
    const starWidth = rect.width / STAR_COUNT;
    const starIndex = Math.floor(relX / starWidth);
    const starFraction = (relX % starWidth) / starWidth;
    const clamped = Math.max(0, Math.min(STAR_COUNT - 1, starIndex));
    const value = clamped + (starFraction < 0.5 ? 0.5 : 1);
    return Math.max(0.5, Math.min(5, value));
}

function formatSelection(min, max) {
    if (min === null) return null;
    if (max === null || max === min) return text.minAndAbove(min);
    return text.minToMax(min, max);
}

function DragRatingFilter({ label, minValue, maxValue, onChange }) {
    const containerRef = useRef(null);
    const dragStartRef = useRef(null);
    const isDraggingRef = useRef(false);
    const [hoverValue, setHoverValue] = useState(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [dragEnd, setDragEnd] = useState(null);
    const [committedMin, setCommittedMin] = useState(minValue);
    const [committedMax, setCommittedMax] = useState(maxValue);

    useEffect(() => {
        setCommittedMin(minValue);
    }, [minValue]);
    useEffect(() => {
        setCommittedMax(maxValue);
    }, [maxValue]);

    const getDisplayMin = () => {
        if (
            isDraggingRef.current &&
            dragStartRef.current !== null &&
            dragEnd !== null
        ) {
            return Math.min(dragStartRef.current, dragEnd);
        }
        return committedMin;
    };

    const getDisplayMax = () => {
        if (
            isDraggingRef.current &&
            dragStartRef.current !== null &&
            dragEnd !== null
        ) {
            const max = Math.max(dragStartRef.current, dragEnd);
            return max === Math.min(dragStartRef.current, dragEnd) ? null : max;
        }
        return committedMax;
    };

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsMouseDown(true);
        const val = getStarValue(e, containerRef);
        if (val === null) return;
        dragStartRef.current = val;
        isDraggingRef.current = true;
        setDragEnd(val);
    }, []);

    const handleMouseMove = useCallback((e) => {
        const val = getStarValue(e, containerRef);
        setHoverValue(val);
        if (isDraggingRef.current) setDragEnd(val);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoverValue(null);
    }, []);

    useEffect(() => {
        const handleGlobalMouseUp = (e) => {
            if (!isDraggingRef.current) return;
            const val = getStarValue(e, containerRef);
            const start = dragStartRef.current;
            isDraggingRef.current = false;
            dragStartRef.current = null;

            if (start === null) {
                setDragEnd(null);
                return;
            }
            const resolvedVal = val ?? start;
            const min = Math.min(start, resolvedVal);
            const max = Math.max(start, resolvedVal);

            if (min === max) {
                setCommittedMin(min);
                setCommittedMax(null);
                onChange({ min, max: null });
            } else {
                setCommittedMin(min);
                setCommittedMax(max);
                onChange({ min, max });
            }

            setDragEnd(null);
            setIsMouseDown(false);
        };

        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }, [onChange]);

    const handleTouchStart = useCallback((e) => {
        const val = getStarValue(e, containerRef);
        if (val === null) return;
        dragStartRef.current = val;
        isDraggingRef.current = true;
        setDragEnd(val);
    }, []);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        const val = getStarValue(e, containerRef);
        if (isDraggingRef.current) setDragEnd(val);
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (!isDraggingRef.current) return;
            const touch = e.changedTouches[0];
            const syntheticE = { clientX: touch.clientX };
            const val = getStarValue(syntheticE, containerRef);
            const start = dragStartRef.current;
            isDraggingRef.current = false;
            setDragEnd(null);

            if (val === null || start === null) return;

            const min = Math.min(start, val);
            const max = Math.max(start, val);

            if (min === max) {
                setCommittedMin(min);
                setCommittedMax(null);
                onChange({ min, max: null });
            } else {
                setCommittedMin(min);
                setCommittedMax(max);
                onChange({ min, max });
            }

            dragStartRef.current = null;
        },
        [onChange],
    );

    const displayMin = getDisplayMin();
    const displayMax = getDisplayMax();
    const selectionText = formatSelection(displayMin, displayMax);

    return (
        <div className="flex flex-col gap-1 items-center">
            <span className="text-xs font-medium text-text-dark">{label}</span>
            <div className="relative w-fit">
                <div
                    ref={containerRef}
                    title={text.clickOrDrag}
                    className={`flex select-none touch-none ${isMouseDown ? "cursor-ew-resize" : "cursor-pointer"}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {Array.from({ length: STAR_COUNT }, (_, i) => {
                        const activeMin = displayMin ?? hoverValue;
                        const activeMax = displayMax;

                        let fill = "empty";
                        if (activeMin !== null) {
                            const starLeftStart = i; // e.g. 0, 1, 2...
                            const starLeftEnd = i + 0.5; // e.g. 0.5, 1.5, 2.5...
                            const starRightStart = i + 0.5; // same as starLeftEnd
                            const starRightEnd = i + 1; // e.g. 1, 2, 3...

                            if (activeMax !== null) {
                                const leftFilled =
                                    starLeftEnd > activeMin &&
                                    starLeftStart < activeMax;
                                const rightFilled =
                                    starRightEnd > activeMin &&
                                    starRightStart < activeMax;

                                if (leftFilled && rightFilled) fill = "full";
                                else if (leftFilled) fill = "left-half";
                                else if (rightFilled) fill = "right-half";
                            } else {
                                // Min only - fill up to activeMin
                                const leftFilled = starLeftEnd <= activeMin;
                                const rightFilled = starRightEnd <= activeMin;

                                if (rightFilled) fill = "full";
                                else if (leftFilled) fill = "left-half";
                            }
                        }

                        return (
                            <svg
                                key={i}
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                className="shrink-0"
                            >
                                <defs>
                                    <clipPath id={`half-left-${label}-${i}`}>
                                        <rect
                                            x="0"
                                            y="0"
                                            width="12"
                                            height="24"
                                        />
                                    </clipPath>
                                    <clipPath id={`half-right-${label}-${i}`}>
                                        <rect
                                            x="12"
                                            y="0"
                                            width="12"
                                            height="24"
                                        />
                                    </clipPath>
                                </defs>
                                <path
                                    d={STAR_PATH}
                                    fill="var(--color-surface-300)"
                                    stroke="none"
                                />
                                {fill === "full" && (
                                    <path
                                        d={STAR_PATH}
                                        fill="var(--color-primary-400)"
                                        stroke="none"
                                    />
                                )}
                                {fill === "left-half" && (
                                    <path
                                        d={STAR_PATH}
                                        fill="var(--color-primary-400)"
                                        stroke="none"
                                        clipPath={`url(#half-left-${label}-${i})`}
                                    />
                                )}
                                {fill === "right-half" && (
                                    <path
                                        d={STAR_PATH}
                                        fill="var(--color-primary-400)"
                                        stroke="none"
                                        clipPath={`url(#half-right-${label}-${i})`}
                                    />
                                )}
                            </svg>
                        );
                    })}
                </div>
                {committedMin !== null && (
                    <button
                        onClick={() => {
                            setCommittedMin(null);
                            setCommittedMax(null);
                            onChange({ min: null, max: null });
                        }}
                        className="absolute -right-5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-mid transition-colors"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
            <span className="text-xs text-text-light min-h-4">
                {selectionText}
            </span>
        </div>
    );
}

export default DragRatingFilter;
