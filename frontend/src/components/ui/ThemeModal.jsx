import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { themeIds } from "../../themes";
import ThemePreview from "./ThemePreview";
import { text } from "../../resources";
import DarkModeToggle from "../layout/DarkModeToggle";

function ThemeModal({
    currentThemeId,
    onThemeChange,
    onThemePreview,
    onClose,
}) {
    const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId);
    const [originalThemeId] = useState(currentThemeId);
    const { isDarkMode, colorMode, setColorMode } = useTheme();

    const handleSelect = (themeId) => {
        setSelectedThemeId(themeId);
        onThemePreview(themeId);
    };

    const handleConfirm = () => {
        if (selectedThemeId !== originalThemeId) {
            onThemeChange(selectedThemeId);
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        if (selectedThemeId !== originalThemeId) {
            onThemePreview(originalThemeId);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) handleClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-text-dark">
                            {text.theme}
                        </h2>
                        <div className="flex items-center gap-3">
                            <DarkModeToggle
                                colorMode={colorMode}
                                onColorModeChange={setColorMode}
                                showText={true}
                            />
                            <button
                                onClick={handleClose}
                                className="text-text-light hover:text-text-dark transition-colors"
                                aria-label={text.close}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="p-5 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-3 gap-3">
                            {themeIds.map((themeId) => (
                                <ThemePreview
                                    key={themeId}
                                    themeId={themeId}
                                    isActive={selectedThemeId === themeId}
                                    onClick={() => handleSelect(themeId)}
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-surface-200">
                        <button
                            onClick={handleClose}
                            className="text-sm text-text-mid hover:text-text-dark transition-colors"
                        >
                            {text.cancel}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedThemeId === originalThemeId}
                            className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition-colors"
                        >
                            {text.apply}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ThemeModal;
