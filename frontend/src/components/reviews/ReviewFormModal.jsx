import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { text } from "../../resources";

export default function ReviewFormModal({ onClose, onReviewSubmitted }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full sm:max-w-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-text-dark">
                            {text.writeReview}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-dark transition-colors cursor-pointer"
                            aria-label={text.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div
                        className="px-5 py-4 max-h-[85vh] overflow-y-scroll"
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        <ReviewForm onReviewSubmitted={onReviewSubmitted} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
