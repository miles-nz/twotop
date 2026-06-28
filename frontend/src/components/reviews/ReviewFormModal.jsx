import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { text } from "../../resources";

export default function ReviewFormModal({ onClose, onReviewSubmitted }) {
    const [cropOpen, setCropOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full sm:max-w-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 shrink-0">
                    <h2 className="text-sm font-medium text-text-dark">
                        {text.writeReview}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-light hover:text-text-dark transition-colors"
                        aria-label={text.close}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div
                    className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-60px)]"
                    onTouchMove={(e) => {
                        if (!cropOpen) e.stopPropagation();
                    }}
                >
                    <ReviewForm
                        onReviewSubmitted={onReviewSubmitted}
                        onCropOpenChange={setCropOpen}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
