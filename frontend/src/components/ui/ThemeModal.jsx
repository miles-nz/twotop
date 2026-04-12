import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { themeIds } from "../../themes";
import ThemePreview from "./ThemePreview";
import { text } from "../../resources";
import DarkModeToggle from "../layout/DarkModeToggle";

const GRID_SIZE = 9;

function ThemeModal({
    currentThemeId,
    onThemeChange,
    onThemePreview,
    onClose,
    isDarkMode,
    onToggleDarkMode,
}) {
    const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId);
    const [originalThemeId] = useState(currentThemeId);

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
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full max-w-sm overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-text-dark">
                            {text.theme}
                        </h2>
                        <div className="flex items-center gap-3">
                            {onToggleDarkMode && (
                                <DarkModeToggle
                                    isDarkMode={isDarkMode}
                                    onToggle={onToggleDarkMode}
                                />
                            )}
                            <button
                                onClick={handleClose}
                                className="text-text-light hover:text-text-dark transition-colors"
                                aria-label={text.close}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 3x3 Grid */}
                    <div className="p-5">
                        <div className="grid grid-cols-3 gap-4">
                            {Array.from({ length: GRID_SIZE }).map((_, i) => {
                                const themeId = themeIds[i];
                                if (!themeId) {
                                    return (
                                        <div
                                            key={i}
                                            className="w-27.5 h-27.5 rounded-xl bg-surface-100 border border-dashed border-surface-300"
                                        />
                                    );
                                }
                                return (
                                    <ThemePreview
                                        key={themeId}
                                        themeId={themeId}
                                        isActive={selectedThemeId === themeId}
                                        onClick={() => handleSelect(themeId)}
                                        isDarkMode={isDarkMode}
                                    />
                                );
                            })}
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
                            Apply
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ThemeModal;
