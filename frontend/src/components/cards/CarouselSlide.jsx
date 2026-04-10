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

    const leftColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary-400")
        .trim();
    const middleColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary-200")
        .trim();
    const rightColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-surface-50")
        .trim();

    return (
        <div className="relative w-full h-full">
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    opacity: loaded ? 0 : 1,
                    background: [
                        `linear-gradient(135deg, ${leftColor}, ${middleColor})`,
                        `linear-gradient(135deg, ${middleColor}, ${rightColor})`,
                        `linear-gradient(135deg, ${rightColor}, ${middleColor})`,
                        `linear-gradient(135deg, ${middleColor}, ${leftColor})`,
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
                {!loaded && <LoadingDots color={rightColor} size="w-3 h-3" />}
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
