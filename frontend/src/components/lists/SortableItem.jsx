import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

export default function SortableItem({
    index,
    dragIndex,
    overIndex,
    dragY,
    getMouseHandlers,
    getTouchHandlers,
    setItemRef,
    children,
}) {
    const isDragging = dragIndex === index;
    const [measuredHeight, setMeasuredHeight] = useState(60);
    const measured = useRef(false);

    let yOffset = 0;
    if (dragIndex !== null && overIndex !== null && !isDragging) {
        const itemH = measuredHeight + 8;
        if (overIndex < dragIndex && index >= overIndex && index < dragIndex) {
            yOffset = itemH;
        } else if (
            overIndex > dragIndex &&
            index > dragIndex &&
            index <= overIndex
        ) {
            yOffset = -itemH;
        }
    }

    return (
        <motion.div
            ref={(el) => {
                setItemRef(index, el);
                if (el && !measured.current) {
                    setMeasuredHeight(el.getBoundingClientRect().height);
                    measured.current = true;
                }
            }}
            animate={{
                y: isDragging ? dragY : dragIndex !== null ? yOffset : 0,
                scale: isDragging ? 1.02 : 1,
                opacity: isDragging ? 0.5 : 1,
                boxShadow: isDragging
                    ? "0 8px 24px rgba(0,0,0,0.12)"
                    : "0 0px 0px rgba(0,0,0,0)",
                zIndex: isDragging ? 10 : 0,
            }}
            transition={
                isDragging
                    ? { duration: 0 }
                    : dragIndex !== null
                      ? { type: "spring", stiffness: 400, damping: 30 }
                      : { duration: 0 }
            }
            className="relative flex items-center gap-3 rounded-lg bg-surface-50 border border-surface-200"
        >
            <div
                className="pl-3 py-3 cursor-grab active:cursor-grabbing text-text-light hover:text-text-dark transition-colors touch-none"
                {...getMouseHandlers(index)}
                {...getTouchHandlers(index)}
                aria-label="Drag to reorder"
            >
                <GripVertical size={16} />
            </div>
            <div className="flex-1 min-w-0">{children}</div>
        </motion.div>
    );
}
