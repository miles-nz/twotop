import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { text } from "../../resources";
import { useBreakpoint } from "../../hooks/useBreakpoint";

const arrowButtonClasses =
    "absolute top-1/2 -translate-y-1/2 bg-black/50 enabled:hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2 transition-all duration-200 z-10 enabled:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400";

function ImageCarousel({ images }) {
    const scrollRef = useRef(null);
    const [enableLeftArrow, setEnableLeftArrow] = useState(false);
    const [enableRightArrow, setEnableRightArrow] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

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
            const scrollTo =
                direction === "left"
                    ? scrollRef.current.scrollLeft - clientWidth
                    : scrollRef.current.scrollLeft + clientWidth;

            scrollRef.current.scrollTo({
                left: scrollTo,
                behavior: "smooth",
            });
        }
    };

    const scrollToIndex = (index) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            if (index == 0) {
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

    const isDesktop = useBreakpoint();

    if (!images || images.length === 0) return null;

    return (
        <div className="relative">
            <div
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {images.map((url, index) => (
                    <div key={index} className="shrink-0 w-full snap-center">
                        <img
                            src={url}
                            className="w-full object-cover"
                            alt={`${text.photo} ${index + 1}`}
                        />
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <>
                    {/* Arrow buttons - desktop only */}
                    {isDesktop && (
                        <>
                            <button
                                onClick={() => scroll("left")}
                                disabled={!enableLeftArrow}
                                className={arrowButtonClasses + " left-2"}
                                aria-label="Previous image"
                                tabIndex={0}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                disabled={!enableRightArrow}
                                className={arrowButtonClasses + " right-2"}
                                aria-label="Next image"
                                tabIndex={0}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    scrollToIndex(index);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                                    index === currentIndex
                                        ? "bg-white scale-125"
                                        : "bg-white/50"
                                }`}
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
