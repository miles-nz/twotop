import { motion } from "framer-motion";
import ImageCarousel from "./ImageCarousel";
import { useCarousel } from "../../hooks/useCarousel";
import { useReviewList } from "../../contexts/ReviewListContext";
import { text } from "../../resources";

function ReviewCardCarousel({ images, reviewId }) {
    const { expandedId, handleExpand } = useReviewList();
    const isExpanded = expandedId === reviewId;
    const { carouselRef, expandedHeight, isCollapsed, setIsCollapsed } =
        useCarousel();

    return (
        <div className="px-6 pt-4">
            <div
                ref={carouselRef}
                className="rounded-xl overflow-hidden cursor-pointer"
                onClick={() => handleExpand(reviewId)}
            >
                <div className="relative">
                    <motion.div
                        initial={{ height: 64 }}
                        animate={{
                            height: isExpanded ? expandedHeight : 64,
                            filter: isExpanded ? "blur(0px)" : "blur(2px)",
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden relative"
                        onAnimationComplete={(definition) => {
                            if ("height" in definition)
                                setIsCollapsed(!isExpanded);
                        }}
                    >
                        <ImageCarousel images={images} />
                    </motion.div>
                    {isCollapsed && !isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <span className="bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                                {text.photoCount(images.length)}
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewCardCarousel;
