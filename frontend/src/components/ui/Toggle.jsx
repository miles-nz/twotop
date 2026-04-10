export default function Toggle({ value, onToggle, ariaLabel, children }) {
    return (
        <button
            onClick={() => onToggle(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                value ? "bg-secondary-500" : "bg-surface-300"
            }`}
            aria-pressed={value}
            aria-label={ariaLabel}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${
                    value ? "translate-x-5" : "translate-x-0"
                }`}
            >
                {children}
            </span>
        </button>
    );
}
