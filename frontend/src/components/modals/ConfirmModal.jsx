import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import { text } from "../../resources";

function ConfirmModal({ isOpen, onConfirm, onCancel, message, deleting }) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-20"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-50 rounded-2xl shadow-xl p-6 z-30 w-80 border border-surface-200"
                    >
                        <p className="text-text-dark font-medium mb-6">
                            {message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="surface" onClick={onCancel}>
                                {text.cancel}
                            </Button>
                            <Button
                                variant="error"
                                onClick={onConfirm}
                                disabled={deleting}
                            >
                                {deleting ? text.deleting : text.delete}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default ConfirmModal;
