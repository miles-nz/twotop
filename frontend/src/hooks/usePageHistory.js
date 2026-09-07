import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const MAX_HISTORY = 5;

export function usePageHistory() {
    const location = useLocation();
    const historyRef = useRef([]);

    useEffect(() => {
        const url = `${window.location.origin}${location.pathname}${location.search}`;
        const prev = historyRef.current;
        if (prev[prev.length - 1] !== url) {
            historyRef.current = [...prev, url].slice(-MAX_HISTORY);
        }
    }, [location.pathname, location.search]);

    return historyRef.current;
}
