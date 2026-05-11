import { useEffect, useRef, useState } from "react";
import { text, tutorialExamples } from "../../resources";

const REVIEW_TEXT = tutorialExamples.reviewTextExample;

export default function SlideWriteReview({
    restaurantName,
    onDone = () => {},
}) {
    const [nameChars, setNameChars] = useState(0);
    const [filledStars, setFilledStars] = useState([0, 0, 0]);
    const [reviewChars, setReviewChars] = useState(-1);
    const timers = useRef([]);

    useEffect(() => {
        const t = (fn, ms) => {
            const id = setTimeout(fn, ms);
            timers.current.push(id);
        };

        let ni = 0;
        const typeName = () => {
            if (ni <= restaurantName.length) {
                setNameChars(ni++);
                t(typeName, 60);
            } else {
                t(() => fillStars(0, 0), 300);
            }
        };

        const fillStars = (group, star) => {
            if (group >= 3) {
                t(() => setReviewChars(0), 200);
                return;
            }
            setFilledStars((prev) => {
                const next = [...prev];
                next[group] = star + 1;
                return next;
            });
            if (star < 4) t(() => fillStars(group, star + 1), 110);
            else t(() => fillStars(group + 1, 0), 180);
        };

        t(typeName, 300);
        return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (reviewChars < 0 || reviewChars > REVIEW_TEXT.length) return;
        if (reviewChars === REVIEW_TEXT.length) {
            onDone();
            return;
        }
        const justTyped = REVIEW_TEXT[reviewChars - 1];
        const isPause = [".", "!", "?"].includes(justTyped);
        const id = setTimeout(
            () => setReviewChars((c) => c + 1),
            isPause ? 450 : 36,
        );
        return () => clearTimeout(id);
    }, [reviewChars]);

    return (
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-3 sm:p-4 w-11/12 text-xs">
            <div className="text-sm font-semibold text-text-dark mb-3 mt-1 h-5">
                {restaurantName.slice(0, nameChars)}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                {[text.foodLabel, text.drinkLabel, text.ambienceLabel].map(
                    (label, gi) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 sm:flex-col sm:items-start"
                        >
                            <div className="text-text-light w-16 sm:w-auto sm:mb-1">
                                {label}
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
                    ),
                )}
            </div>
            <div className="bg-surface-100 rounded-lg p-2 min-h-10 text-text-mid leading-relaxed">
                {reviewChars >= 0 ? (
                    <>
                        {REVIEW_TEXT.slice(0, reviewChars)}
                        <span className="inline-block w-px h-3 bg-text-dark align-middle animate-pulse" />
                    </>
                ) : null}
            </div>
        </div>
    );
}
