import { useState, useRef } from "react";

export function useTransientError(duration = 3000) {
    const [error, setError] = useState(null);
    const timerRef = useRef(null);

    const showError = (message) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setError(message);
        timerRef.current = setTimeout(() => setError(null), duration);
    };

    const clearError = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setError(null);
    };

    return { error, showError, clearError };
}
