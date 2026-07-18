import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { text } from "../../resources";
import { useAutoResize } from "../../hooks/useAutoResize";
import PlacesSearch from "../ui/PlacesSearch";
import Toggle from "../ui/Toggle";
import { useAuth0 } from "@auth0/auth0-react";

export default function CreateListModal({ onClose, onCreated }) {
    const { getAccessTokenSilently } = useAuth0();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isChecklist, setIsChecklist] = useState(false);

    const descriptionRef = useRef(null);
    useAutoResize(descriptionRef, description, { shrinkOnBlur: true });

    const handleAddRestaurant = (place) => {
        if (!place) return;
        // Prevent duplicates by place_id if available, otherwise by name
        const isDuplicate = restaurants.some((r) =>
            place.place_id
                ? r.place_id === place.place_id
                : r.restaurant_name === place.name,
        );
        if (isDuplicate) return;
        setRestaurants((prev) => [
            ...prev,
            {
                place_id: place.place_id || null,
                restaurant_name: place.name,
                restaurant_address: place.address || null,
            },
        ]);
    };

    const handleRemoveRestaurant = (index) => {
        setRestaurants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setError(null);
        if (!name.trim()) {
            setError("List name is required.");
            return;
        }

        setSaving(true);
        try {
            const token = await getAccessTokenSilently();

            // Create the list
            const listRes = await fetch(
                `${import.meta.env.VITE_API_URL}/lists`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim() || null,
                        is_checklist: isChecklist,
                    }),
                },
            );
            const listData = await listRes.json();
            if (!listRes.ok) throw new Error(listData.error);

            // Add restaurants sequentially to preserve order
            for (const restaurant of restaurants) {
                await fetch(
                    `${import.meta.env.VITE_API_URL}/lists/${listData.id}/restaurants`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(restaurant),
                    },
                );
            }

            // Refetch the list to get restaurants attached
            const fullRes = await fetch(
                `${import.meta.env.VITE_API_URL}/lists`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const allLists = await fullRes.json();
            const created = allLists.find((l) => l.id === listData.id);

            onCreated(created || listData);
            onClose();
        } catch (err) {
            console.error("Failed to create list:", err);
            setError(text.errorGeneric);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

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
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full max-w-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-text-dark">
                            {text.createList}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-dark transition-colors"
                            aria-label={text.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] min-h-130 overflow-y-scroll"
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-light uppercase tracking-wide">
                                {text.listNameLabel}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError(null);
                                }}
                                placeholder={text.listNamePlaceholder}
                                maxLength={100}
                                className="border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light"
                            />
                            {error && (
                                <p className="text-xs text-error-500">
                                    {error}
                                </p>
                            )}
                        </div>
                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-light uppercase tracking-wide">
                                {text.listDescriptionLabel}
                            </label>
                            <textarea
                                ref={descriptionRef}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={text.listDescriptionPlaceholder}
                                rows={1}
                                className="border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light resize-none overflow-hidden"
                            />
                        </div>
                        {/* Checklist mode */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-text-light uppercase tracking-wide">
                                    {text.checklistMode}
                                </span>
                                <span className="text-xs text-text-light">
                                    {text.checklistModeDescription}
                                </span>
                            </div>
                            <Toggle
                                value={isChecklist}
                                onToggle={setIsChecklist}
                                ariaLabel={text.checklistMode}
                            />
                        </div>
                        {/* Add restaurants */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-light uppercase tracking-wide">
                                {text.listAddRestaurantsLabel}
                            </label>
                            <PlacesSearch
                                onPlaceSelected={handleAddRestaurant}
                                onManualAdd={(name) =>
                                    handleAddRestaurant({ name })
                                }
                                resetOnSelect={true}
                                showTypingPlaceholder={false}
                                className="w-full border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light"
                            />
                        </div>
                        {restaurants.length === 0 && (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-sm text-text-light text-center">
                                    {text.listNoRestaurantsYet}
                                </p>
                            </div>
                        )}
                        {/* Restaurant list */}
                        {restaurants.length > 0 && (
                            <ul className="flex flex-col gap-2">
                                {restaurants.map((r, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-100 border border-surface-200"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs text-text-light shrink-0">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm text-text-dark truncate">
                                                    {r.restaurant_name}
                                                </p>
                                                {r.restaurant_address && (
                                                    <p className="text-xs text-text-light truncate">
                                                        {r.restaurant_address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleRemoveRestaurant(index)
                                            }
                                            className="p-1.5 rounded-full text-text-light hover:text-error-500 hover:bg-error-100 transition-colors shrink-0"
                                            aria-label={text.removeLabel(
                                                r.restaurant_name,
                                            )}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-surface-200 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="text-sm text-text-mid hover:text-text-dark transition-colors"
                        >
                            {text.cancel}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {saving ? text.saving : text.createList}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
