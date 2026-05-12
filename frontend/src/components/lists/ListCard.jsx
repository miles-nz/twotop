import { motion } from "framer-motion";
import { List, Users, Eye, PenLine, SquareCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { text } from "../../resources";
import Avatar from "../ui/Avatar";

export default function ListCard({ list }) {
    const navigate = useNavigate();
    const restaurantCount = list.restaurants?.length ?? 0;
    const shareCount = list.shares?.length ?? 0;

    return (
        <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/lists/${list.id}`)}
            className="relative w-full h-30 text-left bg-surface-50 border border-surface-200 rounded-2xl p-4 flex flex-col hover:border-surface-300 transition-colors shadow-sm"
        >
            {/* Owner info for shared lists */}
            {list.permission !== "owner" && list.owner_name && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="text-xs text-text-light">
                        {list.owner_name}
                    </span>
                    <Avatar
                        name={list.owner_name}
                        picture={list.owner_picture}
                        size="sm"
                    />
                </div>
            )}

            {/* Name */}
            <p className="text-base font-semibold text-text-dark truncate shrink-0 pr-24">
                {list.name}
            </p>

            {/* Description */}
            <div className="flex-1 mt-2">
                {list.description && (
                    <p className="text-sm text-text-light line-clamp-1">
                        {list.description}
                    </p>
                )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 mt-2 shrink-0">
                {list.is_checklist ? (
                    <span className="flex items-center gap-1.5 text-xs text-text-light">
                        <SquareCheck size={13} />
                        {text.checklistProgress(
                            list.restaurants?.filter((r) => r.checked).length ??
                                0,
                            restaurantCount,
                        )}
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs text-text-light">
                        <List size={13} />
                        {text.restaurantCount(restaurantCount)}
                    </span>
                )}
                {shareCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-text-light">
                        <Users size={13} />
                        {text.sharedWithCount(shareCount)}
                    </span>
                )}
                {list.permission !== "owner" && (
                    <span className="ml-auto">
                        {list.permission === "edit" ? (
                            <PenLine size={14} className="text-secondary-500" />
                        ) : (
                            <Eye size={14} className="text-text-light" />
                        )}
                    </span>
                )}
            </div>
        </motion.button>
    );
}
