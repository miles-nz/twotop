import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowDown } from "lucide-react";
import { preferences } from "../../resources";

export default function PullToRefreshIndicator({ pullDistance, refreshing }) {
    const THRESHOLD = preferences.pullRefreshThreshold;
    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const isTriggered = progress >= 1 || refreshing;

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
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                        opacity: refreshing ? 1 : progress,
                        scale: refreshing ? 1 : 0.6 + progress * 0.4,
                    }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={
                        isTriggered
                            ? { type: "spring", stiffness: 400, damping: 15 }
                            : { duration: 0 }
                    }
                    className="w-8 h-8 rounded-full bg-surface-50 shadow-sm flex items-center justify-center border border-surface-200"
                >
                    <AnimatePresence mode="wait">
                        {!isTriggered ? (
                            <motion.div
                                key="arrow"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ArrowDown
                                    size={16}
                                    className="text-text-light"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={refreshing ? "refreshing" : "triggered"}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.15 }}
                            >
                                <motion.div
                                    key={
                                        refreshing ? "refreshing" : "triggered"
                                    }
                                    animate={{ rotate: refreshing ? 360 : 0 }}
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
                                        className="text-secondary-500"
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
