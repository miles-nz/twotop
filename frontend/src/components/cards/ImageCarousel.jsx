import useEmblaCarousel from "embla-carousel-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { text } from "../../resources";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const arrowClass =
    "absolute top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer";

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
                {!loaded && (
                    <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 rounded-full bg-white"
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-cover object-top transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}

function ImageCarousel({ images }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

    const scrollPrev = useCallback(
        () => emblaApi && emblaApi.scrollPrev(),
        [emblaApi],
    );
    const scrollNext = useCallback(
        () => emblaApi && emblaApi.scrollNext(),
        [emblaApi],
    );

    if (!images || images.length === 0) return null;

    return (
        <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="flex-none w-full aspect-square"
                        >
                            <CarouselSlide
                                src={url}
                                alt={
                                    index === 0
                                        ? text.reviewPhoto
                                        : text.reviewPhotoIndex(index)
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollPrev();
                        }}
                        className={`${arrowClass} left-2`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollNext();
                        }}
                        className={`${arrowClass} right-2`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}
        </div>
    );
}

export default ImageCarousel;
