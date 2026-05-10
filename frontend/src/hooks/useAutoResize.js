import { useEffect, useCallback } from "react";

export function useAutoResize(ref, value, { shrinkOnBlur = false } = {}) {
    const resize = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [ref]);

    const collapse = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
    }, [ref]);

    useEffect(() => {
        resize();
    }, [value, resize]);

    useEffect(() => {
        if (!shrinkOnBlur) return;
        const el = ref.current;
        if (!el) return;
        el.addEventListener("focus", resize);
        el.addEventListener("blur", collapse);
        return () => {
            el.removeEventListener("focus", resize);
            el.removeEventListener("blur", collapse);
        };
    }, [shrinkOnBlur, ref, resize, collapse]);
}
