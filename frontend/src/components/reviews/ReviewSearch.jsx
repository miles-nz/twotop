import { useEffect, useMemo, useRef, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    CalendarArrowUp,
    ArrowUpWideNarrow,
    ArrowDownNarrowWide,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Checkbox from "../ui/Checkbox";
import DragRatingFilter from "../reviews/DragRatingFilter";
import SegmentedControl from "../ui/SegmentedControl";
import { text } from "../../resources";

const SORT_OPTIONS = [
    { value: "date_desc", label: text.newestFirst },
    { value: "date_asc", label: text.oldestFirst },
    { value: "rating_desc", label: text.highestRated },
    { value: "rating_asc", label: text.lowestRated },
];

const USER_FILTER_OPTIONS = [
    { value: "all", label: text.allLabel },
    { value: "mine", label: text.mineLabel },
    { value: "friends", label: text.friendsLabel },
    { value: "public", label: text.publicLabel },
];

function SpecificUserSelect({ allUsers, selectedUserIds, onChange }) {
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState(false);

    const filtered = allUsers.filter((u) =>
        u.reviewer_name?.toLowerCase().includes(search.toLowerCase()),
    );

    const toggle = (userId) => {
        onChange(
            selectedUserIds.includes(userId)
                ? selectedUserIds.filter((id) => id !== userId)
                : [...selectedUserIds, userId],
        );
    };

    if (allUsers.length === 0) return null;

    const showList = focused || search.length > 0 || selectedUserIds.length > 0;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-mid uppercase tracking-wide">
                {text.specificUserLabel}
            </span>
            <div className="border border-surface-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-surface-200">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Search users..."
                        className="w-full text-xs bg-transparent focus:outline-none text-text-dark placeholder-text-light"
                    />
                </div>
                {showList && (
                    <div className="max-h-36 overflow-y-auto">
                        {filtered.map((u) => (
                            <button
                                key={u.user_id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => toggle(u.user_id)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-100 transition-colors text-left"
                            >
                                <div
                                    className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${
                                        selectedUserIds.includes(u.user_id)
                                            ? "bg-secondary-500 border-secondary-500"
                                            : "border-surface-300"
                                    }`}
                                >
                                    {selectedUserIds.includes(u.user_id) && (
                                        <svg
                                            width="8"
                                            height="8"
                                            viewBox="0 0 8 8"
                                            fill="none"
                                        >
                                            <path
                                                d="M1 4l2 2 4-4"
                                                stroke="white"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs text-text-dark">
                                    {u.reviewer_name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReviewSearch({
    filters,
    onChange,
    reviews,
    currentUserId,
}) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);

    useEffect(() => {
        if (!sortOpen) return;
        const handleClickOutside = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [sortOpen]);

    const allUsers = useMemo(() => {
        if (!reviews) return [];
        const seen = new Set();
        const users = [];
        reviews.forEach((r) => {
            if (!seen.has(r.user_id) && r.reviewer_name) {
                seen.add(r.user_id);
                users.push({
                    user_id: r.user_id,
                    reviewer_name: r.reviewer_name,
                });
            }
            (r.contributions || []).forEach((c) => {
                if (!seen.has(c.user_id) && c.reviewer_name) {
                    seen.add(c.user_id);
                    users.push({
                        user_id: c.user_id,
                        reviewer_name: c.reviewer_name,
                    });
                }
            });
        });
        return users;
    }, [reviews]);

    const activeFilterCount = [
        filters.search.length >= 2,
        filters.minFoodRating !== null || filters.maxFoodRating !== null,
        filters.minDrinkRating !== null || filters.maxDrinkRating !== null,
        filters.minAmbienceRating !== null ||
            filters.maxAmbienceRating !== null,
        filters.userFilter.type !== "all",
        filters.userFilter.specificUsers.length > 0,
        filters.dateFrom !== null,
        filters.dateTo !== null,
        filters.collaborativeOnly,
        filters.photosOnly,
        filters.hasAddressOnly,
    ].filter(Boolean).length;

    const set = (key, value) => onChange({ ...filters, [key]: value });
    const setUserFilter = (value) =>
        onChange({ ...filters, userFilter: value });

    const clearAll = () =>
        onChange({
            ...filters,
            search: "",
            minFoodRating: null,
            minDrinkRating: null,
            minAmbienceRating: null,
            dateFrom: null,
            dateTo: null,
            userFilter: { type: "all", specificUsers: [] },
            maxFoodRating: null,
            maxDrinkRating: null,
            maxAmbienceRating: null,
            collaborativeOnly: false,
            photosOnly: false,
            hasAddressOnly: false,
        });

    return (
        <div className="mb-4 flex flex-col gap-4">
            {/* Search bar + sort + filter toggle */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none"
                    />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => set("search", e.target.value)}
                        placeholder="Search reviews..."
                        className="w-full pl-8 pr-8 py-2 text-sm border border-surface-300 rounded-xl bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light"
                    />
                    {filters.search && (
                        <button
                            onClick={() => set("search", "")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-mid transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setSortOpen((v) => !v)}
                        className={`flex items-center px-3 py-2 rounded-2xl border text-sm transition-colors ${
                            filters.sort !== "date_desc"
                                ? "bg-secondary-500 text-white border-secondary-500"
                                : "bg-surface-50 text-text-mid border-surface-300 hover:bg-surface-100"
                        }`}
                        aria-label="Sort reviews"
                    >
                        {filters.sort === "date_desc" && (
                            <ArrowUpDown size={20} />
                        )}
                        {filters.sort === "date_asc" && (
                            <CalendarArrowUp size={20} />
                        )}
                        {filters.sort === "rating_desc" && (
                            <ArrowUpWideNarrow size={20} />
                        )}
                        {filters.sort === "rating_asc" && (
                            <ArrowDownNarrowWide size={20} />
                        )}
                    </button>
                    <AnimatePresence>
                        {sortOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-1 w-40 bg-surface-50 border border-surface-200 rounded-xl shadow-lg overflow-hidden z-10"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <button
                                        key={o.value}
                                        onClick={() => {
                                            set("sort", o.value);
                                            setSortOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                            filters.sort === o.value
                                                ? "bg-secondary-500 text-white"
                                                : "text-text-dark hover:bg-surface-100"
                                        }`}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    className={`relative flex items-center gap-1.5 pl-2 pr-1 py-2 rounded-2xl border text-sm font-medium transition-colors ${
                        filtersOpen || activeFilterCount > 0
                            ? "bg-secondary-500 text-white border-secondary-500"
                            : "bg-surface-50 text-text-mid border-surface-300 hover:bg-surface-100"
                    }`}
                    aria-label={text.filtersLabel}
                >
                    <SlidersHorizontal size={18} />
                    <span className="w-3 flex items-center justify-center text-xs">
                        {activeFilterCount > 0 ? (
                            activeFilterCount
                        ) : filtersOpen ? (
                            <ChevronUp size={10} />
                        ) : (
                            <ChevronDown size={10} />
                        )}
                    </span>
                </button>
            </div>

            {/* Filter panel */}
            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="border border-surface-200 rounded-xl bg-surface-50 p-4 flex flex-col gap-4"
                    >
                        {/* User filter */}
                        <div className="flex flex-col gap-2">
                            <div className="w-full">
                                <SegmentedControl
                                    options={USER_FILTER_OPTIONS.map((o) => ({
                                        value: o.value,
                                        text: o.label,
                                    }))}
                                    value={filters.userFilter.type}
                                    onChange={(val) =>
                                        setUserFilter({
                                            ...filters.userFilter,
                                            type: val,
                                        })
                                    }
                                    ariaLabel="Show reviews"
                                    showIcon={false}
                                    fullWidth={true}
                                />
                            </div>
                        </div>
                        {/* Rating filters */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-medium text-text-mid uppercase tracking-wide">
                                {text.ratingsLabel}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <DragRatingFilter
                                    label={text.foodLabel}
                                    minValue={filters.minFoodRating}
                                    maxValue={filters.maxFoodRating}
                                    onChange={({ min, max }) =>
                                        onChange({
                                            ...filters,
                                            minFoodRating: min,
                                            maxFoodRating: max,
                                        })
                                    }
                                />
                                <DragRatingFilter
                                    label={text.drinkLabel}
                                    minValue={filters.minDrinkRating}
                                    maxValue={filters.maxDrinkRating}
                                    onChange={({ min, max }) =>
                                        onChange({
                                            ...filters,
                                            minDrinkRating: min,
                                            maxDrinkRating: max,
                                        })
                                    }
                                />
                                <DragRatingFilter
                                    label={text.ambienceLabel}
                                    minValue={filters.minAmbienceRating}
                                    maxValue={filters.maxAmbienceRating}
                                    onChange={({ min, max }) =>
                                        onChange({
                                            ...filters,
                                            minAmbienceRating: min,
                                            maxAmbienceRating: max,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Advanced toggle */}
                        <button
                            onClick={() => setAdvancedOpen((v) => !v)}
                            className="flex items-center gap-1 text-xs text-text-light hover:text-text-mid transition-colors w-fit"
                        >
                            {advancedOpen ? (
                                <ChevronUp size={12} />
                            ) : (
                                <ChevronDown size={12} />
                            )}
                            {advancedOpen
                                ? text.hideAdvancedFilters
                                : text.showAdvancedFilters}
                        </button>

                        {/* Advanced filters */}
                        <AnimatePresence>
                            {advancedOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-4 overflow-hidden"
                                >
                                    <div className="border-t border-surface-200 pt-3 flex flex-col gap-4">
                                        {/* Date range */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-medium text-text-mid uppercase tracking-wide">
                                                {text.dateRangeLabel}
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="date"
                                                    value={
                                                        filters.dateFrom ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        set(
                                                            "dateFrom",
                                                            e.target.value ||
                                                                null,
                                                        )
                                                    }
                                                    className="flex-1 text-sm border border-surface-300 rounded-lg px-2 py-1.5 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark"
                                                />
                                                <span className="text-xs text-text-light">
                                                    {text.to}
                                                </span>
                                                <input
                                                    type="date"
                                                    value={filters.dateTo ?? ""}
                                                    onChange={(e) =>
                                                        set(
                                                            "dateTo",
                                                            e.target.value ||
                                                                null,
                                                        )
                                                    }
                                                    className="flex-1 text-sm border border-surface-300 rounded-lg px-2 py-1.5 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark"
                                                />
                                            </div>
                                        </div>

                                        {/* Specific user */}
                                        <SpecificUserSelect
                                            allUsers={allUsers}
                                            selectedUserIds={
                                                filters.userFilter.specificUsers
                                            }
                                            onChange={(ids) =>
                                                setUserFilter({
                                                    ...filters.userFilter,
                                                    specificUsers: ids,
                                                })
                                            }
                                        />

                                        {/* Checkboxes */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-medium text-text-mid uppercase tracking-wide">
                                                {text.other}
                                            </span>
                                            <Checkbox
                                                checked={
                                                    filters.collaborativeOnly
                                                }
                                                onChange={(v) =>
                                                    set("collaborativeOnly", v)
                                                }
                                                label={
                                                    text.collaborativeReviewsOnly
                                                }
                                            />
                                            <Checkbox
                                                checked={filters.photosOnly}
                                                onChange={(v) =>
                                                    set("photosOnly", v)
                                                }
                                                label={text.hasPhotosLabel}
                                            />
                                            <Checkbox
                                                checked={filters.hasAddressOnly}
                                                onChange={(v) =>
                                                    set("hasAddressOnly", v)
                                                }
                                                label={
                                                    text.hasVerifiedAddressLabel
                                                }
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Clear all */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-error-500 hover:text-error-600 transition-colors w-fit"
                            >
                                {text.clearFilters}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
