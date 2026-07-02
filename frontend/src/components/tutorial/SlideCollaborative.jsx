import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { text, tutorial } from "../../resources";

const REVIEW_TEXT = tutorial.reviewTextExampleCollaborator;

export default function SlideCollaborative({
    userSet,
    restaurantName,
    onDone = () => {},
}) {
    const [pressed, setPressed] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filledStars, setFilledStars] = useState([0, 0, 0]);
    const [reviewChars, setReviewChars] = useState(-1);
    const [zoomAvatars, setZoomAvatars] = useState(false);
    const [showSecondAv, setShowSecondAv] = useState(false);
    const [showBothNames, setShowBothNames] = useState(false);
    const timers = useRef([]);

    useEffect(() => {
        const t = (fn, ms) => {
            const id = setTimeout(fn, ms);
            timers.current.push(id);
        };

        t(() => {
            setPressed(true);
        }, 1000);
        t(() => {
            setPressed(false);
            setShowForm(true);
        }, 1300);

        const starDelay = 1800;
        const starGap = 100;

        [0, 1, 2].forEach((group) => {
            [1, 2, 3, 4, 5].forEach((star) => {
                t(
                    () => {
                        setFilledStars((prev) => {
                            const next = [...prev];
                            next[group] = star;
                            return next;
                        });
                    },
                    starDelay + (group * 5 + (star - 1)) * starGap,
                );
            });
        });

        const afterStars = starDelay + 20 * starGap;
        t(() => setReviewChars(0), afterStars);
        t(
            () => setZoomAvatars(true),
            afterStars + REVIEW_TEXT.length * 36 + 600,
        );
        t(
            () => {
                setShowSecondAv(true);
                setShowBothNames(true);
            },
            afterStars + REVIEW_TEXT.length * 36 + 1800,
        );
        t(() => onDone(), afterStars + REVIEW_TEXT.length * 36 + 3000);

        return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (reviewChars < 0 || reviewChars >= REVIEW_TEXT.length) return;
        const justTyped = REVIEW_TEXT[reviewChars - 1];
        const isPause = [".", "!", "?"].includes(justTyped);
        const id = setTimeout(
            () => setReviewChars((c) => c + 1),
            isPause ? 450 : 36,
        );
        return () => clearTimeout(id);
    }, [reviewChars]);

    return (
        <motion.div
            className="bg-surface-50 rounded-xl border border-surface-200 p-4 w-10/12 text-xs"
            animate={zoomAvatars ? { scale: 2.1 } : { scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ transformOrigin: "85% top", willChange: "transform" }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-text-dark">
                    {restaurantName}
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="text-text-light text-right flex items-center"
                        style={{ minHeight: "2.5rem" }}
                    >
                        <motion.span
                            key={showBothNames ? "both" : "one"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="block"
                        >
                            {showBothNames ? (
                                <>
                                    <span className="whitespace-nowrap">
                                        {userSet[0].name} &
                                    </span>
                                    <br />
                                    <span className="whitespace-nowrap">
                                        {userSet[1].name}
                                    </span>
                                </>
                            ) : (
                                <span className="whitespace-nowrap">
                                    {userSet[0].name}
                                </span>
                            )}
                        </motion.span>
                    </div>
                    <div className="flex">
                        <div
                            className={`w-7 h-7 rounded-full ${userSet[0].bg} ${userSet[0].text} flex items-center justify-center text-xs font-medium border-2 border-surface-50`}
                        >
                            {userSet[0].initials}
                        </div>
                        <div
                            className={`w-7 h-7 rounded-full ${userSet[1].bg} ${userSet[1].text} flex items-center justify-center text-xs font-medium border-2 border-surface-50 -ml-2 transition-all duration-500`}
                            style={{
                                opacity: showSecondAv ? 1 : 0,
                                transform: showSecondAv
                                    ? "scale(1)"
                                    : "scale(0.6)",
                            }}
                        >
                            {userSet[1].initials}
                        </div>
                    </div>
                </div>
            </div>
            {!showForm ? (
                <motion.button
                    className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs mx-auto block"
                    animate={pressed ? { scale: 0.93 } : { scale: 1 }}
                    transition={{ duration: 0.1 }}
                    tabIndex={-1}
                >
                    {text.addYourReviewButtonLabel}
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-surface-100 rounded-lg p-3"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className={`w-7 h-7 rounded-full ${userSet[1].bg} ${userSet[1].text} flex items-center justify-center text-xs font-medium shrink-0`}
                        >
                            {userSet[1].initials}
                        </div>
                        <span className="text-text-dark font-medium">
                            {userSet[1].name}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        {[
                            text.foodLabel,
                            text.drinkLabel,
                            text.ambienceLabel,
                        ].map((l, gi) => (
                            <div
                                key={l}
                                className="flex items-center gap-2 sm:flex-col sm:items-start flex-1"
                            >
                                <div className="text-text-light w-16 sm:w-auto sm:mb-1">
                                    {l}
                                </div>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, si) => (
                                        <span
                                            key={si}
                                            className={`text-sm transition-colors duration-100 ${
                                                si < filledStars[gi]
                                                    ? "text-primary-400"
                                                    : "text-surface-300"
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-surface-50 rounded h-8 p-1 text-text-mid leading-relaxed overflow-hidden">
                        {reviewChars >= 0 ? (
                            <>
                                {REVIEW_TEXT.slice(0, reviewChars)}
                                <span className="inline-block w-px h-3 bg-text-dark align-middle animate-pulse" />
                            </>
                        ) : null}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
