import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { text } from "../../resources";
import CarouselSlide from "./CarouselSlide";

function ImageCarousel({ images }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        watchDrag: images.length > 1,
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
            )}
        </div>
    );
}

export default ImageCarousel;
