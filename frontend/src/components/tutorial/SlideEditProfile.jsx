import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Camera } from "lucide-react";
import { tutorial } from "../../resources";
import { makeExampleTutorialEmail } from "../../utils";

export default function SlideEditProfile({ userSet, onDone }) {
    const exampleName = userSet?.[0]?.name ?? "John";
    const exampleInitial = userSet?.[0]?.initials ?? "J";
    const exampleEmail =
        makeExampleTutorialEmail(exampleName) ?? "john@example.com";
    const exampleEmailInitial = exampleEmail?.[0]?.toUpperCase() ?? "J";
    const avatarBg = userSet?.[0]?.bg ?? "bg-surface-200";
    const avatarText = userSet?.[0]?.text ?? "text-text-light";

    const [phase, setPhase] = useState("idle");
    const [typedName, setTypedName] = useState("");
    const [showCursor, setShowCursor] = useState(false);

    useEffect(() => {
        const timers = [];
        const t = (fn, ms) => {
            const id = setTimeout(fn, ms);
            timers.push(id);
        };

        // Type name
        t(() => setPhase("clicking"), 800);
        t(() => {
            setPhase("typing");
            setShowCursor(true);
        }, 1200);

        exampleName.split("").forEach((_, i) => {
            t(() => setTypedName(exampleName.slice(0, i + 1)), 1400 + i * 120);
        });

        const afterTyping = 1400 + exampleName.length * 120;

        t(() => setPhase("confirming"), afterTyping + 400);
        t(() => setShowCursor(false), afterTyping + 400);
        t(() => setPhase("nameDone"), afterTyping + 900);

        // Photo upload sequence
        t(() => setPhase("cameraClick"), afterTyping + 1800);
        t(() => setPhase("done"), afterTyping + 2200);
        t(() => onDone?.(), afterTyping + 2500);

        return () => timers.forEach(clearTimeout);
    }, []);

    const isEditing = phase === "typing" || phase === "confirming";
    const isNameDone =
        phase === "nameDone" || phase === "cameraClick" || phase === "done";
    const isDone = phase === "done";

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 w-11/12 text-xs flex flex-col items-center gap-3">
                {/* Avatar with camera button */}
                <div className="relative">
                    {/* Avatar */}
                    <motion.div
                        className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${avatarBg} ${avatarText}`}
                    >
                        {isDone ? (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-4xl leading-none select-none"
                            >
                                😄
                            </motion.span>
                        ) : (
                            <span className="text-lg font-semibold">
                                {isNameDone
                                    ? exampleInitial
                                    : exampleEmailInitial}
                            </span>
                        )}
                    </motion.div>

                    {/* Camera button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={
                            isNameDone && !isDone
                                ? { opacity: 1, scale: 1 }
                                : { opacity: 0, scale: 0 }
                        }
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-0 left-0 p-1.5 bg-surface-50 border border-surface-200 rounded-full"
                    >
                        <motion.div
                            animate={
                                phase === "cameraClick"
                                    ? { scale: 0.85 }
                                    : { scale: 1 }
                            }
                            transition={{ duration: 0.15 }}
                        >
                            <Camera size={10} className="text-text-light" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Name field */}
                <motion.div
                    animate={
                        phase === "clicking" ? { scale: 0.96 } : { scale: 1 }
                    }
                    transition={{ duration: 0.15 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        isEditing
                            ? "border border-secondary-400 bg-surface-50"
                            : "bg-surface-50"
                    }`}
                >
                    {isEditing ? (
                        <span className="text-sm text-text-dark">
                            {typedName}
                            {showCursor && (
                                <span className="inline-block w-px h-3.5 bg-text-dark align-middle ml-px animate-pulse" />
                            )}
                        </span>
                    ) : (
                        <>
                            <span
                                className={`text-sm ${isNameDone ? "font-medium" : ""} text-text-dark`}
                            >
                                {isNameDone ? exampleName : exampleEmail}
                            </span>
                            {!isNameDone && (
                                <Pencil
                                    size={11}
                                    className="text-secondary-400"
                                />
                            )}
                            {isNameDone && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Check
                                        size={11}
                                        className="text-secondary-400"
                                    />
                                </motion.div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Fake profile rows */}
                <div className="w-full flex flex-col gap-2 mt-1 opacity-30 blur-xs">
                    {["Settings", "Friends", "Theme"].map((item) => (
                        <div
                            key={item}
                            className="w-full h-7 bg-surface-200 rounded-lg"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
