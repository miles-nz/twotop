import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SlideWelcome from "./SlideWelcome";
import SlideWriteReview from "./SlideWriteReview";
import SlideSharing from "./SlideSharing";
import SlideCollaborative from "./SlideCollaborative";
import SlideThemes from "./SlideThemes";
import ReplayButton from "./ReplayButton";
import { text, tutorialExamples } from "../../resources";

const SLIDES = [
    {
        title: "",
        sub: "",
        Component: SlideWelcome,
        hasReplay: false,
    },
    {
        title: tutorialExamples.slideText.writeReview.title,
        sub: tutorialExamples.slideText.writeReview.sub,
        Component: SlideWriteReview,
        hasReplay: true,
    },
    {
        title: tutorialExamples.slideText.sharing.title,
        sub: tutorialExamples.slideText.sharing.sub,
        Component: SlideSharing,
        hasReplay: true,
    },
    {
        title: tutorialExamples.slideText.collaborative.title,
        sub: tutorialExamples.slideText.collaborative.sub,
        Component: SlideCollaborative,
        hasReplay: true,
    },
    {
        title: tutorialExamples.slideText.themes.title,
        sub: tutorialExamples.slideText.themes.sub,
        Component: SlideThemes,
        hasReplay: false,
    },
];

export default function WelcomeTutorial({ onDismiss }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [slideKey, setSlideKey] = useState(0);
    const [done, setDone] = useState(false);
    const [userSet, setUserSet] = useState(() =>
        tutorialExamples.randomUserSet(),
    );
    const [restaurantName, setRestaurantName] = useState(() =>
        tutorialExamples.randomRestaurantName(),
    );

    const goto = (n) => {
        setDirection(n > current ? 1 : -1);
        setCurrent(n);
        setSlideKey((k) => k + 1);
        setDone(false);
    };

    const next = () => {
        if (current < SLIDES.length - 1) goto(current + 1);
        else onDismiss();
    };

    const prev = () => {
        if (current > 0) goto(current - 1);
    };

    const handleReplay = () => {
        setDone(false);
        setSlideKey((k) => k + 1);
        if (current === 2) setUserSet(tutorialExamples.nextUserSet(userSet));
        if (current === 1)
            setRestaurantName(tutorialExamples.randomRestaurantName());
    };

    const { title, sub, Component, hasReplay } = SLIDES[current];

    const variants = {
        enter: (dir) => ({ opacity: 0, x: dir * 24 }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir * -24 }),
    };

    const touchStartX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
        }
        touchStartX.current = null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-50 rounded-2xl w-full max-w-lg overflow-hidden border border-surface-200"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22 }}
                        className="px-8 pt-8 pb-6 flex flex-col gap-4"
                    >
                        <div>
                            {title && (
                                <h2 className="text-lg font-semibold text-text-dark">
                                    {title}
                                </h2>
                            )}
                            {sub && (
                                <p className="text-sm text-text-light mt-1 leading-relaxed min-h-17">
                                    {sub}
                                </p>
                            )}
                        </div>
                        <div
                            className={`relative rounded-xl bg-surface-100 overflow-hidden flex items-center justify-center ${current === 0 ? "h-94" : "h-69"} select-none`}
                        >
                            {done && hasReplay && (
                                <ReplayButton onReplay={handleReplay} />
                            )}
                            <Component
                                key={slideKey}
                                userSet={userSet}
                                restaurantName={restaurantName}
                                onDone={
                                    hasReplay ? () => setDone(true) : undefined
                                }
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="px-8 pb-7 flex items-center justify-between border-t border-surface-200 pt-4">
                    <div className="flex gap-1.5">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                    i === current
                                        ? "bg-text-dark"
                                        : "bg-surface-300"
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {current > 0 && (
                            <button
                                onClick={prev}
                                className="px-4 py-1.5 rounded-lg text-sm outline outline-surface-200 text-text-mid hover:bg-surface-100 transition-colors"
                            >
                                {text.back}
                            </button>
                        )}
                        <button
                            onClick={next}
                            className="px-4 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                        >
                            {current === SLIDES.length - 1
                                ? text.gotIt
                                : text.next}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
