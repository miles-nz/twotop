import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import NotificationItem from "../ui/NotificationItem";
import { text } from "../../resources";

export default function NotificationDropdown({
    notifications,
    loading,
    onResolve,
    onClose,
}) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-surface-50 border border-surface-200 rounded-lg shadow-lg overflow-hidden z-50"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                <h3 className="text-sm font-medium text-text-dark">
                    {text.notifications}
                </h3>
                <button
                    onClick={onClose}
                    aria-label={text.close}
                    className="text-text-light hover:text-text-dark transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {loading && (
                    <p className="text-sm text-text-light text-center py-6">
                        {text.loading}
                    </p>
                )}
                {!loading && notifications.length === 0 && (
                    <p className="text-sm text-text-light text-center py-6">
                        {text.noNotifications}
                    </p>
                )}
                {!loading &&
                    notifications.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onResolve={onResolve}
                        />
                    ))}
            </div>
        </motion.div>
    );
}
