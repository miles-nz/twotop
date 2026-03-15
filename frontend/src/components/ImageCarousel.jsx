import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { text } from "../resources";
import { ChevronLeft, ChevronRight } from "lucide-react";

const arrowClass =
    "absolute top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer";

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
                            className="flex-none w-full aspect-square bg-surface-200"
                        >
                            <img
                                src={url}
                                alt={
                                    index === 0
                                        ? text.reviewPhoto
                                        : text.reviewPhotoIndex(index)
                                }
                                className="w-full h-full object-cover"
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
