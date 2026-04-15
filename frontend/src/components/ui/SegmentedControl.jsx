import { motion } from "framer-motion";

export default function SegmentedControl({
    options,
    value,
    onChange,
    ariaLabel,
    showIcon = true,
    showText = true,
}) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="inline-flex items-center bg-surface-200 rounded-full p-1"
        >
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={option.label ?? option.text}
                        onClick={() => onChange(option.value)}
                        className="relative flex items-center justify-center gap-1 px-2 py-1.5 rounded-full cursor-pointer focus:outline-none"
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="segment-indicator"
                                className="absolute inset-0 bg-surface-50 rounded-full shadow-sm"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                        <span
                            className={`relative z-10 flex items-center gap-1 transition-colors duration-200 ${
                                isSelected
                                    ? "text-text-dark"
                                    : "text-text-light hover:text-text-mid"
                            }`}
                        >
                            {showIcon && option.icon}
                            {showText && option.text && (
                                <span className="text-xs font-medium whitespace-nowrap">
                                    {option.text}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
