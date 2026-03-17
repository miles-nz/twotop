import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../ui/Avatar";
import { text } from "../../resources";

/**
 * AvatarDropdown
 *
 * Props:
 * - user: Auth0 user object (required)
 * - onLogout: function to call on logout (required)
 * - showName: boolean (optional, default false) - whether to show the user's name next to the avatar
 * - buttonClassName: string (optional) - extra classes for the button
 * - dropdownClassName: string (optional) - extra classes for the dropdown
 */
export default function AvatarDropdown({
    user,
    onLogout,
    showName = false,
    buttonClassName = "",
    dropdownClassName = "",
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${buttonClassName}`}
            >
                <Avatar name={user?.name} picture={user?.picture} />
                {showName && (
                    <span className="text-sm text-text-mid">{user?.name}</span>
                )}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-32 bg-surface-50 border border-surface-200 rounded-lg shadow-lg overflow-hidden z-50 ${dropdownClassName}`}
                    >
                        <button
                            onClick={() => {
                                onLogout();
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 transition-colors text-left"
                        >
                            {text.logOut}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
