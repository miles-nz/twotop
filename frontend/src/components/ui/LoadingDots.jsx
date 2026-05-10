import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";

const createEase =
    (sharpness = 5) =>
    (t) =>
        t < 0.5
            ? Math.pow(2 * t, sharpness) / 2
            : 1 - Math.pow(2 * (1 - t), sharpness) / 2;

const interpolateColor = (colorA, colorB, progress) => {
    const parse = (hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
    const [ar, ag, ab] = parse(colorA);
    const [br, bg, bb] = parse(colorB);
    const r = Math.round(ar + (br - ar) * progress);
    const g = Math.round(ag + (bg - ag) * progress);
    const b = Math.round(ab + (bb - ab) * progress);
    return `rgb(${r},${g},${b})`;
};

const resolveColor = (variable) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(variable.replace("var(", "").replace(")", "").trim())
        .trim();

function LoadingDots({
    size = 12,
    logoColours = false,
    colourValue = 500,
    speed = 1,
}) {
    const orbitRadius = size / 3;
    const containerSize = orbitRadius * 2 + size;
    const duration = 750 / speed;
    const pauseDuration = 100 / speed;
    const cycleDuration = duration + pauseDuration;
    const customEase = createEase(2);
    const translationAmount = (3 * size) / 5;

    const resolvedTop = logoColours
        ? resolveColor("--color-logo-primary")
        : resolveColor(`--color-secondary-${colourValue}`);
    const resolvedBottom = logoColours
        ? resolveColor("--color-logo-secondary")
        : resolveColor(`--color-secondary-${colourValue}`);
    const resolvedTopMid = logoColours
        ? resolveColor("--color-logo-primary")
        : resolveColor(`--color-secondary-${Math.max(colourValue - 200, 100)}`);
    const resolvedBottomMid = logoColours
        ? resolveColor("--color-logo-secondary")
        : resolveColor(`--color-secondary-${Math.max(colourValue - 200, 100)}`);

    const topX = useMotionValue(0);
    const topY = useMotionValue(0);
    const bottomX = useMotionValue(0);
    const bottomY = useMotionValue(0);
    const elapsed = useRef(0);
    const topColor = useMotionValue(resolvedTop);
    const bottomColor = useMotionValue(resolvedBottom);

    useAnimationFrame((_, delta) => {
        elapsed.current = (elapsed.current + delta) % (cycleDuration * 2);

        const cycleProgress = elapsed.current % cycleDuration;
        const cycle = Math.floor(elapsed.current / cycleDuration);
        const rotProgress = Math.min(cycleProgress / duration, 1);
        const easedProgress = customEase(rotProgress);
        const rotAngle =
            cycle % 2 === 0
                ? easedProgress * Math.PI * 2
                : -easedProgress * Math.PI * 2;
        const transY =
            cycle % 2 === 0
                ? easedProgress * translationAmount
                : (1 - easedProgress) * translationAmount;

        const colorProgress = Math.sin(easedProgress * Math.PI);
        topColor.set(
            interpolateColor(resolvedTop, resolvedTopMid, colorProgress),
        );
        bottomColor.set(
            interpolateColor(resolvedBottom, resolvedBottomMid, colorProgress),
        );

        const topOrbitCX = containerSize / 2 + orbitRadius;
        const topOrbitCY = size / 5 + orbitRadius;
        topX.set(
            topOrbitCX + orbitRadius * Math.cos(Math.PI + rotAngle) - size / 2,
        );
        topY.set(
            topOrbitCY +
                orbitRadius * Math.sin(Math.PI + rotAngle) -
                size / 2 +
                transY,
        );

        const bottomOrbitCX = containerSize / 2 - orbitRadius;
        const bottomOrbitCY = containerSize - size / 5 - orbitRadius;
        bottomX.set(
            bottomOrbitCX + orbitRadius * Math.cos(rotAngle) - size / 2,
        );
        bottomY.set(
            bottomOrbitCY +
                orbitRadius * Math.sin(rotAngle) -
                size / 2 -
                transY,
        );
    });

    return (
        <div
            style={{
                width: containerSize,
                height: containerSize,
                position: "relative",
                isolation: "isolate",
            }}
        >
            <motion.div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: topColor,
                    position: "absolute",
                    x: topX,
                    y: topY,
                    mixBlendMode: "screen",
                    opacity: 0.9,
                    boxShadow: `0 2px 4px color-mix(in srgb, var(--color-text-dark) 30%, transparent)`,
                }}
            />
            <motion.div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: bottomColor,
                    position: "absolute",
                    x: bottomX,
                    y: bottomY,
                    mixBlendMode: "screen",
                    opacity: 0.9,
                    boxShadow: `0 2px 4px color-mix(in srgb, var(--color-text-dark) 30%, transparent)`,
                }}
            />
        </div>
    );
}

export default LoadingDots;
