import { useEffect, useState } from "react";

function AnimatedColon({
    size = "1em",
    colorTop = "var(--color-logo-primary)",
    colorBottom = "var(--color-logo-secondary)",
    initialColor = "var(--color-text-dark)",
    duration = 1000,
    delay = 750,
    overlap = false,
    style = {},
    disableAnimation = false,
    ...props
}) {
    const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    const [split, setSplit] = useState(prefersReduced || disableAnimation);

    useEffect(() => {
        if (prefersReduced || disableAnimation) return;
        const timer = setTimeout(() => setSplit(true), delay);
        return () => clearTimeout(timer);
    }, [delay, prefersReduced, disableAnimation]);

    const dotSize = "1em";
    const gap = overlap ? 0.7 : 1.5; // overlapping or separated
    const containerHeight = overlap
        ? `calc(1em + ${gap}em)`
        : `calc(2em + ${gap - 1}em)`;
    const startY = overlap ? `${gap / 2}em` : "1em";
    const bottomFinalY = `${gap}em`;

    return (
        <span
            style={{
                display: "inline-block",
                position: "relative",
                width: dotSize,
                height: containerHeight,
                verticalAlign: "middle",
                fontSize: `calc(${size} * 0.2)`,
                isolation: overlap ? "isolate" : undefined,
                ...style,
            }}
            {...props}
        >
            {/* Top dot */}
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    background: split ? colorTop : initialColor,
                    transition: `transform ${duration}ms cubic-bezier(.6,1.5,.5,1), opacity ${duration}ms${split ? `, background ${duration}ms, box-shadow ${duration}ms` : ""}`,
                    transform: split
                        ? "translateY(0)"
                        : `translateY(${startY})`,
                    opacity: 1,
                    boxShadow: split
                        ? "0 0 1px 0.5px rgba(255,255,255,0.5)"
                        : undefined,
                }}
            />
            {/* Bottom dot */}
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    background: split ? colorBottom : initialColor,
                    transition: `transform ${duration}ms cubic-bezier(.6,1.5,.5,1), opacity ${duration}ms${split ? `, background ${duration}ms, box-shadow ${duration}ms` : ""}`,
                    transform: split
                        ? `translateY(${bottomFinalY})`
                        : `translateY(${startY})`,
                    opacity: 1,
                    mixBlendMode: overlap ? "multiply" : undefined,
                    boxShadow: split
                        ? "0 0 1px 0.5px rgba(255,255,255,0.5)"
                        : undefined,
                }}
            />
        </span>
    );
}

export default AnimatedColon;
