import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { text } from "../../resources";
import Avatar from "../ui/Avatar";

function SharedWithModal({
    sharedWith,
    onSharedWithChange,
    onClose,
    getAccessTokenSilently,
    currentUserEmail,
}) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState(sharedWith);

    const handleAdd = async () => {
        setError(null);
        if (!email || !email.includes("@")) {
            setError(text.invalidEmail);
            return;
        }

        if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
            setError(text.ownReviewAccess);
            return;
        }

        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user?email=${encodeURIComponent(email)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || text.userNotFound);
                return;
            }

            if (users.find((u) => u.user_id === data.user_id)) {
                setError(text.alreadyHasAccess);
                return;
            }

            const newUsers = [...users, data];
            setUsers(newUsers);
            onSharedWithChange(newUsers);
            setEmail("");
        } catch (err) {
            console.error("SharedWithModal error:", err);
            setError(text.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (userId) => {
        const newUsers = users.filter((u) => u.user_id !== userId);
        setUsers(newUsers);
        onSharedWithChange(newUsers);
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
                    if (e.target === e.currentTarget) onClose();
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
                            {text.sharedWithLabel}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-dark transition-colors"
                            aria-label={text.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Add user */}
                    <div className="px-5 py-4 border-b border-surface-200">
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAdd()
                                }
                                placeholder={text.enterEmailAddress}
                                className="flex-1 text-sm border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={loading}
                                className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {loading ? text.saving : text.add}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-error-500 mt-2">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* User list */}
                    <div className="px-5 py-2 max-h-64 overflow-y-auto">
                        {users.length === 0 ? (
                            <p className="text-sm text-text-light py-4 text-center">
                                {text.noSharedReviews}
                            </p>
                        ) : (
                            <ul className="divide-y divide-surface-200">
                                {users.map((u) => (
                                    <li
                                        key={u.user_id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={u.name}
                                                picture={u.picture}
                                            />
                                            <span className="text-sm text-text-dark">
                                                {u.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleRemove(u.user_id)
                                            }
                                            className="text-text-light hover:text-error-500 transition-colors"
                                            aria-label={text.removeLabel(
                                                u.name,
                                            )}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-surface-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="text-sm text-text-mid hover:text-text-dark transition-colors"
                        >
                            {text.done}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default SharedWithModal;
