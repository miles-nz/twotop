import { motion } from "framer-motion";

function LoadingDots({ color = "bg-primary-400", size = "w-2 h-2" }) {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`${size} ${color} rounded-full`}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

export default LoadingDots;
