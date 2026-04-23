function Checkbox({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <div
                className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${
                    checked
                        ? "bg-secondary-500 border-secondary-500"
                        : "border-surface-300 bg-surface-50"
                }`}
            >
                {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                            d="M1.5 5l2.5 2.5 4.5-4.5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            {label && <span className="text-sm text-text-dark">{label}</span>}
        </label>
    );
}

export default Checkbox;
