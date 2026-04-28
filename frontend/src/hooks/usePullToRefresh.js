import { useEffect, useRef, useState } from "react";
import { preferences } from "../resources";

const THRESHOLD = preferences.pullRefreshThreshold; // px to pull before triggering refresh
const MAX_PULL = 100; // max px the indicator will travel

const isStandalone = () =>
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

export default function usePullToRefresh() {
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(null);
    const pulling = useRef(false);
    const pullDistanceRef = useRef(0);

    useEffect(() => {
        if (!isStandalone()) return;

        const handleTouchStart = (e) => {
            if (window.scrollY !== 0) return;
            startY.current = e.touches[0].clientY;
            pulling.current = true;
        };

        const handleTouchMove = (e) => {
            if (!pulling.current || startY.current === null) return;
            if (window.scrollY !== 0) {
                pulling.current = false;
                pullDistanceRef.current = 0;
                setPullDistance(0);
                return;
            }
            const delta = e.touches[0].clientY - startY.current;
            if (delta < 0) {
                pullDistanceRef.current = 0;
                setPullDistance(0);
                return;
            }
            // Resistance so it feels natural
            const distance = Math.min(delta * 0.5, MAX_PULL);
            pullDistanceRef.current = distance;
            setPullDistance(distance);
        };

        const handleTouchEnd = () => {
            if (!pulling.current) return;
            pulling.current = false;
            startY.current = null;

            if (pullDistanceRef.current >= THRESHOLD) {
                setRefreshing(true);
                setTimeout(() => {
                    window.location.reload();
                }, 500); // brief delay so spinner is visible before reload
            } else {
                setPullDistance(0);
            }
        };

        document.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        document.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return { pullDistance, refreshing };
}
