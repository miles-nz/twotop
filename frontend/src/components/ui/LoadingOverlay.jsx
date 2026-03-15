import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function LoadingOverlay({ isVisible }) {
    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default LoadingOverlay;
