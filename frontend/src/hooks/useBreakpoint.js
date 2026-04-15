import { useState, useEffect } from "react";

const TAILWIND_BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
};

const resolveBreakpoint = (breakpoint) => {
    if (typeof breakpoint === "string") {
        const resolved = TAILWIND_BREAKPOINTS[breakpoint];
        if (resolved === undefined) {
            console.warn(
                `useBreakpoint: unknown breakpoint "${breakpoint}". Use a Tailwind breakpoint (sm, md, lg, xl, 2xl) or a pixel number.`,
            );
            return 0;
        }
        return resolved;
    }
    return breakpoint;
};

export function useBreakpoint(breakpoint) {
    const px = resolveBreakpoint(breakpoint);
    const [isAbove, setIsAbove] = useState(window.innerWidth >= px);

    useEffect(() => {
        const handler = () => setIsAbove(window.innerWidth >= px);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [px]);

    return isAbove;
}
