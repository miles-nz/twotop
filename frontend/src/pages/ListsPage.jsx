import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { List } from "lucide-react";
import { text } from "../resources";
import ListCard from "../components/lists/ListCard";
import CreateListModal from "../components/lists/CreateListModal";
import LoadingDots from "../components/ui/LoadingDots";
import { useTheme } from "../contexts/ThemeContext";

export default function ListsPage({ refreshTrigger }) {
    const { getAccessTokenSilently } = useAuth0();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { currentThemeId } = useTheme();

    const fetchLists = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/lists`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setLists(data);
        } catch (err) {
            console.error("Failed to fetch lists:", err);
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists, refreshTrigger]);

    const handleCreated = (newList) => {
        setLists((prev) => [newList, ...prev]);
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-24 px-4 sm:px-6 lg:px-0">
            {/* Floating + button */}
            <button
                onClick={() => setCreateModalOpen(true)}
                className="fixed bottom-22 sm:bottom-8 right-4 sm:right-8 z-40 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-colors duration-200 drop-shadow-lg cursor-pointer"
                style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                aria-label={text.createList}
            >
                <motion.span
                    animate={{ rotate: createModalOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                >
                    +
                </motion.span>
            </button>

            {/* Loading */}
            {loading && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key="loading"
                        className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200 flex items-center justify-center min-h-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LoadingDots
                            logoColours={currentThemeId === "default-theme"}
                        />
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Empty state */}
            {!loading && lists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <List size={40} className="text-surface-300" />
                    <p className="text-sm text-text-light text-center">
                        {text.noLists}
                    </p>
                </div>
            )}

            {/* Lists grid */}
            {!loading && lists.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {lists.map((list) => (
                            <motion.div
                                key={list.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ListCard list={list} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create list modal */}
            <AnimatePresence>
                {createModalOpen && (
                    <CreateListModal
                        key="create-list-modal"
                        onClose={() => setCreateModalOpen(false)}
                        onCreated={handleCreated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
