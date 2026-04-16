import { useRef, useLayoutEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

export default function SegmentedControl({
    options,
    value,
    onChange,
    ariaLabel,
    showIcon = true,
    showText = true,
}) {
    const containerRef = useRef(null);
    const buttonRefs = useRef([]);
    const [segmentWidth, setSegmentWidth] = useState(0);
    const x = useMotionValue(0);
    const isDragging = useRef(false);

    const selectedIndex = options.findIndex((o) => o.value === value);

    useLayoutEffect(() => {
        const widths = buttonRefs.current.map((b) => b?.offsetWidth ?? 0);
        const maxWidth = Math.max(...widths);
        if (maxWidth > 0) setSegmentWidth(maxWidth);
    }, [options, showText, showIcon]);

    useLayoutEffect(() => {
        if (segmentWidth === 0) return;
        animate(x, selectedIndex * segmentWidth, {
            type: "spring",
            stiffness: 400,
            damping: 30,
        });
    }, [selectedIndex, segmentWidth]);

    const handleDragStart = () => {
        isDragging.current = true;
    };

    const handleDragEnd = () => {
        if (segmentWidth === 0) return;
        const snappedIndex = Math.min(
            Math.max(Math.round(x.get() / segmentWidth), 0),
            options.length - 1,
        );
        animate(x, snappedIndex * segmentWidth, {
            type: "spring",
            stiffness: 400,
            damping: 30,
        });
        if (snappedIndex !== selectedIndex) {
            onChange(options[snappedIndex].value);
        }
        setTimeout(() => {
            isDragging.current = false;
        }, 0);
    };

    const handleTap = (e) => {
        if (isDragging.current || !segmentWidth) return;
        const rect = containerRef.current.getBoundingClientRect();
        const tapX = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left - 4;
        const tappedIndex = Math.min(
            Math.max(Math.floor(tapX / segmentWidth), 0),
            options.length - 1,
        );
        onChange(options[tappedIndex].value);
    };

    return (
        <div
            ref={containerRef}
            role="radiogroup"
            aria-label={ariaLabel}
            className="relative inline-flex items-center bg-surface-200 rounded-full p-1 cursor-pointer user-select-none"
            onPointerUp={handleTap}
        >
            {/* Indicator */}
            {segmentWidth > 0 && (
                <motion.div
                    drag="x"
                    dragConstraints={{
                        left: 0,
                        right: segmentWidth * (options.length - 1),
                    }}
                    dragElastic={0}
                    dragMomentum={false}
                    style={{ x, width: segmentWidth }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="absolute top-1 bottom-1 left-1 bg-surface-50 rounded-full shadow-sm z-10"
                />
            )}

            {/* Segments -- visual only */}
            {options.map((option, index) => {
                const isSelected = value === option.value;
                return (
                    <div
                        key={option.value}
                        ref={(el) => (buttonRefs.current[index] = el)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={option.label ?? option.text}
                        style={
                            segmentWidth ? { width: segmentWidth } : undefined
                        }
                        className={`relative z-20 flex items-center justify-center gap-1 px-2 py-1.5 rounded-full pointer-events-none transition-colors duration-200 ${
                            isSelected ? "text-text-dark" : "text-text-light"
                        }`}
                    >
                        {showIcon && option.icon}
                        {showText && option.text && (
                            <span className="text-xs font-medium whitespace-nowrap">
                                {option.text}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
