import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { emojiOptions } from "../../resources";

function EmojiPicker({ type, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const handleOpen = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
        setOpen(true);
    };

    const handleSelect = (emoji) => {
        onChange(emoji);
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                ref={buttonRef}
                onClick={handleOpen}
                className="text-lg cursor-pointer hover:scale-125 transition-transform"
            >
                {value}
            </button>
            {open &&
                createPortal(
                    <AnimatePresence>
                        <div
                            key="overlay"
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            key="picker"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed z-50 bg-surface-50 border border-surface-200 rounded-xl shadow-lg p-2"
                            style={{ top: position.top, left: position.left }}
                        >
                            <div className="grid grid-cols-3 gap-1">
                                {emojiOptions[type].map((emoji, index) => (
                                    <button
                                        key={`${index}-${emoji}`}
                                        type="button"
                                        onClick={() => handleSelect(emoji)}
                                        className={`text-xl p-2 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors ${value === emoji ? "bg-surface-200" : ""}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}

export default EmojiPicker;
