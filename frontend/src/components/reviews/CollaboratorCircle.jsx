import { useState, useRef, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../ui/Avatar";
import { ContributorPicker } from "./FormComponents";
import { text } from "../../resources";

function CollaboratorCircle({ sharedWith, selectedContributors, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const hasContributors = selectedContributors.length > 0;

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => setOpen((prev) => !prev)}
                className="cursor-pointer flex items-center"
            >
                <AnimatePresence mode="popLayout">
                    {hasContributors ? (
                        <motion.div
                            key="avatars"
                            className="flex items-center -space-x-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {selectedContributors
                                .slice(0, 2)
                                .map((person, i) => (
                                    <div
                                        key={person.user_id}
                                        className="rounded-full ring-2 ring-surface-50"
                                        style={{ zIndex: 2 - i }}
                                    >
                                        <Avatar
                                            name={person.name}
                                            picture={person.picture}
                                            size="lg"
                                        />
                                    </div>
                                ))}
                            {selectedContributors.length > 2 && (
                                <div
                                    className="w-10 h-10 rounded-full bg-surface-300 ring-2 ring-surface-50 flex items-center justify-center text-xs text-text-mid"
                                    style={{ zIndex: 0 }}
                                >
                                    +{selectedContributors.length - 1}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="w-10 h-10 rounded-full bg-surface-200 hover:bg-surface-300 transition-colors flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <UserPlus size={20} className="text-text-mid" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {open && (
                <div className="absolute right-0 top-12 z-10 bg-surface-50 border border-surface-200 rounded-xl shadow-lg p-3 w-56">
                    <p className="text-xs font-medium text-text-mid mb-2">
                        {text.selectContributors}
                    </p>
                    <ContributorPicker
                        sharedWith={sharedWith}
                        selectedContributors={selectedContributors}
                        onToggle={onToggle}
                    />
                </div>
            )}
        </div>
    );
}

export default CollaboratorCircle;
