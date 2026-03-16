import { motion } from "framer-motion";
import ImageCarousel from "./ImageCarousel";
import { useCarousel } from "../../hooks/useCarousel";
import { useReviewList } from "../../contexts/ReviewListContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { preferences, text } from "../../resources";

function ReviewCardCarousel({ images, reviewId }) {
    const { expandedId, handleExpand } = useReviewList();
    const isExpanded = expandedId === reviewId;
    const { carouselRef, expandedHeight, isCollapsed, setIsCollapsed } =
        useCarousel();

    const isDesktop = useBreakpoint();
    const shouldCollapse = isDesktop && preferences.collapseReviewImages;

    return (
        <div className="pt-0">
            <div
                ref={carouselRef}
                className={`relative overflow-hidden ${shouldCollapse ? "cursor-pointer" : ""}`}
                onClick={() => shouldCollapse && handleExpand(reviewId)}
            >
                <motion.div
                    initial={{ height: shouldCollapse ? 64 : expandedHeight }}
                    animate={{
                        height: shouldCollapse
                            ? isExpanded
                                ? expandedHeight
                                : 64
                            : expandedHeight,
                        filter: shouldCollapse
                            ? isExpanded
                                ? "blur(0px)"
                                : "blur(2px)"
                            : "blur(0px)",
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden relative"
                    onAnimationComplete={(definition) => {
                        if ("height" in definition) setIsCollapsed(!isExpanded);
                    }}
                >
                    <ImageCarousel images={images} />
                </motion.div>
                {shouldCollapse && isCollapsed && !isExpanded && (
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
    );
}

export default ReviewCardCarousel;
