import { motion } from "framer-motion";

const THUMB_SIZE = 20; // w-5 h-5 = 20px
const TRACK_WIDTH = 44; // w-11 = 44px
const DRAG_MAX = TRACK_WIDTH - THUMB_SIZE - 4; // 4px = 2x 0.5 offset

export default function Toggle({ value, onToggle, ariaLabel, children }) {
    const handleDragEnd = (_, info) => {
        // Snap based on drag velocity or final position
        if (info.velocity.x > 200) {
            if (!value) onToggle(true);
        } else if (info.velocity.x < -200) {
            if (value) onToggle(false);
        } else {
            // Snap based on position
            const newValue =
                info.offset.x + (value ? DRAG_MAX : 0) > DRAG_MAX / 2;
            if (newValue !== value) onToggle(newValue);
        }
    };

    return (
        <button
            onClick={() => onToggle(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                value ? "bg-secondary-500" : "bg-surface-300"
            }`}
            aria-pressed={value}
            aria-label={ariaLabel}
        >
            <motion.span
                drag="x"
                dragConstraints={{ left: 0, right: DRAG_MAX }}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                onClick={(e) => e.preventDefault()}
                animate={{ x: value ? DRAG_MAX : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.span>
        </button>
    );
}
