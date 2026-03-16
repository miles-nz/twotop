import { useState, useEffect } from "react";

export function useBreakpoint(breakpoint = 640) {
    const [isAbove, setIsAbove] = useState(window.innerWidth >= breakpoint);

    useEffect(() => {
        const handler = () => setIsAbove(window.innerWidth >= breakpoint);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [breakpoint]);

    return isAbove;
}
