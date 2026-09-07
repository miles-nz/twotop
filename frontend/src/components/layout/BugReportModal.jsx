import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";
import { text } from "../../resources";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";

const MAX_LENGTH = 1000;

export default function BugReportModal({
    user,
    getAccessTokenSilently,
    onClose,
}) {
    const { pageHistory } = useUser();
    const { currentThemeId, colorMode } = useTheme();

    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [screenshot, setScreenshot] = useState(null);

    const fileInputRef = useRef(null);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError(text.reportBugDescriptionRequired);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("description", description);
            formData.append("page_history", JSON.stringify(pageHistory));
            formData.append("name", user?.name || "");
            formData.append("email", user?.email || "");
            formData.append("user_agent", navigator.userAgent);
            formData.append(
                "viewport",
                `${window.innerWidth}x${window.innerHeight}`,
            );
            formData.append("theme_id", currentThemeId);
            formData.append("color_mode", colorMode);
            if (screenshot) formData.append("screenshot", screenshot);

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/feedback/bug-report`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || text.reportBugError);
                return;
            }
            setSubmitted(true);
        } catch {
            setError(text.reportBugError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 max-w-sm w-full p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-text-dark">
                            {text.reportBugTitle}
                        </h2>
                        <button onClick={onClose}>
                            <X size={18} className="text-text-light" />
                        </button>
                    </div>

                    {submitted ? (
                        <>
                            <p className="text-sm text-text-dark">
                                {text.reportBugSuccess}
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 text-sm text-secondary-500"
                            >
                                {text.close}
                            </button>
                        </>
                    ) : (
                        <>
                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value.slice(0, MAX_LENGTH),
                                    )
                                }
                                placeholder={text.reportBugHelper}
                                rows={4}
                                className="w-full text-sm border border-surface-200 rounded-lg p-2 resize-none"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="flex flex-col items-center justify-center gap-1.5 w-full text-sm text-text-light hover:text-text-dark transition-colors mt-3 py-4 border border-dashed border-surface-200 rounded-lg"
                            >
                                <ImagePlus size={24} />
                                {screenshot
                                    ? screenshot.name
                                    : text.reportBugAddScreenshot}
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setScreenshot(e.target.files[0] || null)
                                }
                                className="hidden"
                                ref={fileInputRef}
                            />
                            {error && (
                                <p className="text-xs text-error-500 mt-1">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-3 w-full bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 text-white text-sm py-2 rounded-lg"
                            >
                                {loading ? text.sending : text.submit}
                            </button>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
