import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { text } from "../../resources";

export default function SlideLists({ listSet, onDone = () => {} }) {
    const [visibleRestaurants, setVisibleRestaurants] = useState(1);
    const [typedName, setTypedName] = useState("");
    const [buttonPressed, setButtonPressed] = useState(false);
    const [showThird, setShowThird] = useState(false);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [checked, setChecked] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [checklistOn, setChecklistOn] = useState(false);
    const timers = useRef([]);

    const { listName, restaurants } = listSet;
    const THIRD = restaurants[2];

    useEffect(() => {
        const t = (fn, ms) => {
            const id = setTimeout(fn, ms);
            timers.current.push(id);
            return id;
        };

        const SECOND = restaurants[1];

        // type second restaurant
        const typeStart2 = 600;
        SECOND.split("").forEach((_, i) => {
            t(() => setTypedName(SECOND.slice(0, i + 1)), typeStart2 + i * 60);
        });

        const afterTyping2 = typeStart2 + SECOND.length * 60;
        t(() => setButtonPressed(true), afterTyping2 + 300);
        t(() => {
            setButtonPressed(false);
            setTypedName("");
            setVisibleRestaurants(2);
        }, afterTyping2 + 600);

        // type third restaurant
        const typeStart3 = afterTyping2 + 1100;
        THIRD.split("").forEach((_, i) => {
            t(() => setTypedName(THIRD.slice(0, i + 1)), typeStart3 + i * 60);
        });

        const afterTyping3 = typeStart3 + THIRD.length * 60;
        t(() => setButtonPressed(true), afterTyping3 + 300);
        t(() => {
            setButtonPressed(false);
            setTypedName("");
            setShowThird(true);
        }, afterTyping3 + 600);

        // menu + checklist
        t(() => setMenuOpen(true), afterTyping3 + 1000);
        t(() => {
            setChecklistOn(true);
            setShowCheckboxes(true);
        }, afterTyping3 + 1700);
        t(() => setMenuOpen(false), afterTyping3 + 2700);
        t(() => setChecked(1), afterTyping3 + 3000);
        t(() => setChecked(2), afterTyping3 + 3800);
        t(() => setChecked(3), afterTyping3 + 4600);
        t(() => onDone(), afterTyping3 + 5000);

        return () => timers.current.forEach(clearTimeout);
    }, []);

    const allRestaurants = [
        { name: restaurants[0] },
        { name: restaurants[1] },
        { name: THIRD },
    ];

    return (
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 w-11/12 text-xs">
            {/* List header */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-text-dark">
                    {listName}
                </div>
                <div className="relative">
                    {/* Three dots button */}
                    <div className="w-6 h-6 flex items-center justify-center rounded text-text-light cursor-default select-none">
                        <MoreVertical size={14} />
                    </div>
                    {/* Dropdown */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={
                            menuOpen
                                ? { opacity: 1, scale: 1, y: 0 }
                                : { opacity: 0, scale: 0.95, y: -4 }
                        }
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-7 w-40 bg-surface-50 border border-surface-200 rounded-lg shadow-md z-10 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-3 py-2 gap-2">
                            <span className="text-text-dark text-xs">
                                {text.checklistMode}
                            </span>
                            {/* Mini toggle */}
                            <div
                                className={`w-7 h-4 rounded-full transition-colors duration-300 flex items-center px-0.5 ${
                                    checklistOn
                                        ? "bg-primary-500"
                                        : "bg-surface-300"
                                }`}
                            >
                                <div
                                    className="w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300"
                                    style={{
                                        transform: checklistOn
                                            ? "translateX(12px)"
                                            : "translateX(0)",
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Add input row */}
            <div className="flex gap-2 mb-3">
                <div className="flex-1 min-w-0 border border-surface-200 rounded-lg px-3 py-1.5 bg-surface-50 text-xs overflow-hidden whitespace-nowrap">
                    {typedName.length > 0 ? (
                        <span className="text-text-dark">
                            {typedName}
                            <span className="inline-block w-px h-3 bg-text-dark align-middle animate-pulse" />
                        </span>
                    ) : (
                        <span className="text-text-light">
                            {text.searchRestaurant}
                        </span>
                    )}
                </div>
                <motion.button
                    className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs"
                    animate={buttonPressed ? { scale: 0.93 } : { scale: 1 }}
                    transition={{ duration: 0.1 }}
                    tabIndex={-1}
                >
                    {text.add}
                </motion.button>
            </div>

            {/* Restaurant rows */}
            <div className="flex flex-col divide-y divide-surface-200">
                {allRestaurants.map((r, i) => {
                    const isVisible =
                        i < 2 ? visibleRestaurants > i : showThird;
                    return (
                        <div
                            key={r.name}
                            className="flex items-center gap-2 py-2"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible
                                    ? "translateY(0)"
                                    : "translateY(8px)",
                                transition: "opacity 0.4s, transform 0.4s",
                            }}
                        >
                            {/* Checkbox */}
                            <div
                                className="shrink-0 w-4 h-4"
                                style={{
                                    opacity: showCheckboxes ? 1 : 0,
                                    transition: "opacity 0.3s",
                                }}
                            >
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-300 ${
                                        i <= checked - 1
                                            ? "bg-primary-500 border-primary-500"
                                            : "border-surface-300 bg-surface-50"
                                    }`}
                                >
                                    {i <= checked - 1 && (
                                        <motion.svg
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            viewBox="0 0 10 10"
                                            className="w-2.5 h-2.5"
                                        >
                                            <polyline
                                                points="1.5,5 4,7.5 8.5,2.5"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </motion.svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-text-light text-xs w-3 shrink-0 text-center">
                                {i + 1}
                            </span>
                            {/* Name */}
                            <span
                                className={`text-text-dark text-xs transition-opacity duration-300 ${
                                    i <= checked - 1
                                        ? "opacity-40"
                                        : "opacity-100"
                                }`}
                            >
                                {r.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
