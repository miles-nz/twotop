import { useState, useRef, useEffect } from "react";

export function useCarousel() {
    const carouselRef = useRef(null);
    const [expandedHeight, setExpandedHeight] = useState(64);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        if (carouselRef.current) {
            setExpandedHeight(carouselRef.current.offsetWidth);
        }
    }, []);

    return {
        carouselRef,
        expandedHeight,
        isCollapsed,
        setIsCollapsed,
    };
}
