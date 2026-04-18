import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export default function ReplayButton({ onReplay }) {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={onReplay}
            tabIndex={-1}
            className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full text-text-light/80 hover:text-text-mid border border-surface-300/50 bg-surface-50/50 hover:bg-surface-200 hover:border-surface-300 transition-colors cursor-pointer"
        >
            <RotateCcw size={14} />
        </motion.button>
    );
}
