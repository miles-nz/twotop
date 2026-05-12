function Button({ onClick, children, variant = "primary", disabled = false }) {
    const styles = {
        primary: "bg-primary-500 text-white px-6 py-2 hover:bg-primary-600",
        surface:
            "bg-surface-200 text-text-dark px-4 py-2 hover:bg-surface-300 text-sm",
        secondary:
            "bg-secondary-500 text-white px-6 py-2 hover:bg-secondary-600",
        error: "bg-error-600 text-white px-6 py-2 hover:bg-error-700",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${styles[variant]} rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
            {children}
        </button>
    );
}

export default Button;
