import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { preferences } from "../../resources";

export default function PullToRefreshIndicator({ pullDistance, refreshing }) {
    const THRESHOLD = preferences.pullRefreshThreshold;
    const isTriggered = pullDistance >= THRESHOLD || refreshing;

    if (pullDistance === 0 && !refreshing) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 flex justify-center z-100 pointer-events-none"
            style={{
                paddingTop: refreshing ? 16 : Math.max(pullDistance - 20, 0),
            }}
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="w-8 h-8 rounded-full bg-surface-50 shadow-sm flex items-center justify-center border border-surface-200"
                >
                    <motion.div
                        key={refreshing ? "refreshing" : "pulling"}
                        animate={{
                            rotate: refreshing
                                ? 360
                                : Math.min(
                                      (pullDistance / THRESHOLD) * 360,
                                      360,
                                  ),
                        }}
                        transition={
                            refreshing
                                ? {
                                      duration: 0.6,
                                      repeat: Infinity,
                                      ease: "linear",
                                  }
                                : { duration: 0 }
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isTriggered
                                    ? "text-secondary-500"
                                    : "text-text-light"
                            }
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
