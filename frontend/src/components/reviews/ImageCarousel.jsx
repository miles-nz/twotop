import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { text } from "../../resources";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";

const arrowButtonClasses =
    "absolute top-1/2 -translate-y-1/2 bg-black/50 enabled:hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2 transition-all duration-200 z-10 enabled:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400";

function ImageCarousel({ images, lqips, labels }) {
    const scrollRef = useRef(null);
    const [enableLeftArrow, setEnableLeftArrow] = useState(false);
    const [enableRightArrow, setEnableRightArrow] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState({});
    const [errorImages, setErrorImages] = useState({});
    const { currentThemeId } = useTheme();

    const handleScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const newIndex = Math.round(scrollLeft / clientWidth);
        setCurrentIndex(newIndex);
        setEnableLeftArrow(scrollLeft > 0 && newIndex > 0);
        setEnableRightArrow(
            scrollLeft + clientWidth < scrollWidth &&
                newIndex < images.length - 1,
        );
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            scrollRef.current.scrollTo({
                left:
                    direction === "left"
                        ? scrollRef.current.scrollLeft - clientWidth
                        : scrollRef.current.scrollLeft + clientWidth,
                behavior: "smooth",
            });
        }
    };

    const scrollToIndex = (index) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            if (index === 0) {
                setEnableLeftArrow(false);
                setEnableRightArrow(true);
            } else if (index === images.length - 1) {
                setEnableLeftArrow(true);
                setEnableRightArrow(false);
            }
            scrollRef.current.scrollTo({
                left: index * clientWidth,
                behavior: "smooth",
            });
        }
    };

    const isDesktop = useBreakpoint("md");

    if (!images || images.length === 0) return null;

    return (
        <div className="relative">
            <div
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {images.map((url, index) => {
                    const lqip = lqips?.[index];
                    const label = labels?.[index];
                    return (
                        <div
                            key={index}
                            className="shrink-0 w-full snap-center relative aspect-square overflow-hidden"
                        >
                            {/* LQIP or fallback placeholder */}
                            <div
                                className={`absolute inset-0 transition-opacity duration-500 ${loadedImages[index] ? "opacity-0" : "opacity-100"} z-0`}
                            >
                                {lqip ? (
                                    <img
                                        src={lqip}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{
                                            filter: "blur(8px)",
                                            transform: "scale(1.1)",
                                        }}
                                        aria-hidden
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full bg-surface-200 animate-pulse" />
                                )}
                            </div>

                            {errorImages[index] && (
                                <div className="absolute inset-0 bg-surface-200 flex items-center justify-center z-10">
                                    <ImageOff
                                        size={32}
                                        className="text-text-light"
                                    />
                                </div>
                            )}
                            <img
                                src={url}
                                className={`w-full h-full object-cover transition-opacity duration-500 ${loadedImages[index] ? "opacity-100" : "opacity-0"} relative z-10`}
                                alt={`${text.photo} ${index + 1}`}
                                loading="lazy"
                                onLoad={() =>
                                    setLoadedImages((prev) => ({
                                        ...prev,
                                        [index]: true,
                                    }))
                                }
                                onError={() =>
                                    setErrorImages((prev) => ({
                                        ...prev,
                                        [index]: true,
                                    }))
                                }
                            />

                            {label && (
                                <span className="absolute bottom-3 left-3 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                    {label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {images.length > 1 && (
                <>
                    {isDesktop && (
                        <>
                            <button
                                onClick={() => scroll("left")}
                                disabled={!enableLeftArrow}
                                className={arrowButtonClasses + " left-2"}
                                aria-label={text.previousImage}
                                tabIndex={0}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                disabled={!enableRightArrow}
                                className={arrowButtonClasses + " right-2"}
                                aria-label={text.nextImage}
                                tabIndex={0}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                                    index === currentIndex
                                        ? "bg-white scale-125"
                                        : "bg-white/50"
                                }`}
                                aria-label={text.goToImage(
                                    index,
                                    images.length,
                                )}
                                {...(index === currentIndex && {
                                    "aria-current": "true",
                                })}
                                tabIndex={0}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ImageCarousel;
