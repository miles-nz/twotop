import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import LoadingDots from "../ui/LoadingDots";

function CarouselSlide({ src, alt }) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setLoaded(true);
        }
    }, []);

    const user1Color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary-400")
        .trim();
    const gradientMid = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-gradient-mid")
        .trim();
    const lightColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-surface-50")
        .trim();

    return (
        <div className="relative w-full h-full">
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    opacity: loaded ? 0 : 1,
                    background: [
                        `linear-gradient(135deg, ${user1Color}, ${gradientMid})`,
                        `linear-gradient(135deg, ${gradientMid}, ${lightColor})`,
                        `linear-gradient(135deg, ${lightColor}, ${gradientMid})`,
                        `linear-gradient(135deg, ${gradientMid}, ${user1Color})`,
                    ],
                }}
                transition={{
                    opacity: { duration: 0.5 },
                    background: {
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "mirror",
                    },
                }}
            >
                {!loaded && <LoadingDots color={lightColor} size="w-3 h-3" />}
            </motion.div>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}

export default CarouselSlide;
