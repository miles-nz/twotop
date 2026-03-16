import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { text } from "../../resources";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import CarouselSlide from "./CarouselSlide";

function ImageCarousel({ images }) {
    const isDesktop = useBreakpoint();

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        watchDrag: images.length > 1 && !isDesktop, // Only enable dragging on mobile
        dragFree: false,
        containScroll: "keepSnaps",
    });

    const [currentIndex, setCurrentIndex] = useState(0);

    const updateIndex = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", updateIndex);
        emblaApi.on("init", updateIndex);
        return () => {
            emblaApi.off("select", updateIndex);
            emblaApi.off("init", updateIndex);
        };
    }, [emblaApi, updateIndex]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative select-none">
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
                    {/* Arrow buttons - desktop only */}
                    {isDesktop && (
                        <>
                            <button
                                onClick={scrollPrev}
                                disabled={currentIndex === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 enabled:hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2 transition-all duration-200 z-10 enabled:cursor-pointer"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={scrollNext}
                                disabled={currentIndex === images.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 enabled:hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2 transition-all duration-200 z-10 enabled:cursor-pointer"
                                aria-label="Next image"
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    emblaApi?.scrollTo(index);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                    index === currentIndex
                                        ? "bg-white scale-125"
                                        : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ImageCarousel;
