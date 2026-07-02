import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SlideWelcome from "./SlideWelcome";
import SlideWriteReview from "./SlideWriteReview";
import SlideSharing from "./SlideSharing";
import SlideCollaborative from "./SlideCollaborative";
import SlideThemes from "./SlideThemes";
import SlideLists from "./SlideLists";
import SlideSetName from "./SlideSetName";
import SlideEditProfile from "./SlideEditProfile";
import ReplayButton from "./ReplayButton";
import { text, tutorial } from "../../resources";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../../contexts/UserContext";

const BASE_SLIDES = [
    {
        title: "",
        sub: "",
        Component: SlideWelcome,
        hasReplay: false,
    },
    {
        title: tutorial.slideText.writeReview.title,
        sub: tutorial.slideText.writeReview.sub,
        Component: SlideWriteReview,
        hasReplay: true,
    },
    {
        title: tutorial.slideText.sharing.title,
        sub: tutorial.slideText.sharing.sub,
        Component: SlideSharing,
        hasReplay: true,
    },
    {
        title: tutorial.slideText.collaborative.title,
        sub: tutorial.slideText.collaborative.sub,
        Component: SlideCollaborative,
        hasReplay: true,
    },
    {
        title: tutorial.slideText.lists.title,
        sub: tutorial.slideText.lists.sub,
        Component: SlideLists,
        hasReplay: true,
    },
    {
        title: tutorial.slideText.themes.title,
        sub: tutorial.slideText.themes.sub,
        Component: SlideThemes,
        hasReplay: false,
    },
];

const NAME_SLIDE = {
    title: tutorial.setNameSlideHeading,
    sub: tutorial.setNameSlideSubheading,
    Component: SlideSetName,
    hasReplay: false,
    isNameSlide: true,
};

const EDITPROFILE_SLIDE = {
    title: tutorial.editProfileHeading,
    sub: tutorial.editProfileSubheading,
    Component: SlideEditProfile,
    hasReplay: true,
    isEditProfileSlide: true,
};

const variants = {
    enter: (dir) => ({ opacity: 0, x: dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir * -24 }),
};

export default function WelcomeTutorial({
    onDismiss,
    showNamePrompt,
    onNameSaved,
}) {
    const SLIDES = [
        ...BASE_SLIDES,
        ...(showNamePrompt ? [NAME_SLIDE] : []),
        EDITPROFILE_SLIDE,
    ];

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [slideKey, setSlideKey] = useState(0);
    const [done, setDone] = useState(false);

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(null);
    const [saving, setSaving] = useState(false);

    const { getAccessTokenSilently, user } = useAuth0();
    const { updateCurrentUserName, setReviewerNameUpdate } = useUser();

    const email = user?.email ?? null;
    const [userSet, setUserSet] = useState(() => {
        return tutorial.getUserSetForEmail(email) ?? tutorial.randomUserSet();
    });
    const [restaurantName, setRestaurantName] = useState(() => {
        return (
            tutorial.getRestaurantNameForEmail(email) ??
            tutorial.randomRestaurantName()
        );
    });
    const [listSet, setListSet] = useState(() => {
        return tutorial.getListSetForEmail(email) ?? tutorial.randomListSet();
    });

    const goto = (n) => {
        setDirection(n > current ? 1 : -1);
        setCurrent(n);
        setSlideKey((k) => k + 1);
        setDone(false);
    };

    const isNameSlide = SLIDES[current]?.isNameSlide;

    const next = () => {
        if (current < SLIDES.length - 1) goto(current + 1);
        else onDismiss();
    };

    const prev = () => {
        if (current > 0) goto(current - 1);
    };

    const handleNameSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError(text.errorUserNameRequired);
            return;
        }
        setSaving(true);
        setNameError(null);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/name`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: trimmed }),
                },
            );
            if (!response.ok) throw new Error(text.errorGeneric);
            updateCurrentUserName(trimmed);
            setReviewerNameUpdate({ name: trimmed, userId: user.sub });
            onNameSaved();
            next();
        } catch (err) {
            setNameError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReplay = () => {
        setDone(false);
        setSlideKey((k) => k + 1);
        if (current === 1) setRestaurantName(tutorial.randomRestaurantName());
        if (current === 2) setUserSet(tutorial.nextUserSet(userSet));
        if (current === 4) setListSet(tutorial.randomListSet());
    };

    const { title, sub, Component, hasReplay } = SLIDES[current];

    const touchStartX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && !isNameSlide) next();
            else prev();
        }
        touchStartX.current = null;
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

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
                                listSet={listSet}
                                onDone={
                                    hasReplay ? () => setDone(true) : undefined
                                }
                                name={name}
                                setName={setName}
                                nameError={nameError}
                                onSkip={next}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="px-8 pb-7 flex items-center justify-between border-t border-surface-200 pt-4">
                    <div className="flex gap-1.5">
                        <div className="flex gap-1.5">
                            {current !== 0 &&
                                !SLIDES[current]?.isNameSlide &&
                                !(
                                    SLIDES[current]?.isEditProfileSlide &&
                                    showNamePrompt
                                ) &&
                                SLIDES.map((slide, i) => {
                                    if (i === 0 || slide.isNameSlide)
                                        return null;
                                    if (
                                        slide.isEditProfileSlide &&
                                        showNamePrompt
                                    )
                                        return null;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                                i === current
                                                    ? "bg-text-dark"
                                                    : "bg-surface-300"
                                            }`}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {current > 0 && (
                            <button
                                onClick={prev}
                                className="px-4 py-1.5 rounded-lg text-sm outline outline-surface-200 text-text-mid hover:bg-surface-100 transition-colors"
                            >
                                {text.back}
                            </button>
                        )}
                        {isNameSlide ? (
                            <button
                                onClick={handleNameSave}
                                disabled={!name.trim() || saving}
                                className="px-4 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? text.saving : text.save}
                            </button>
                        ) : (
                            <button
                                onClick={next}
                                className="px-4 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                {current === SLIDES.length - 1
                                    ? text.gotIt
                                    : text.next}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
