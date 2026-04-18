import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { text } from "../../resources";

const makeEmail = (name) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
        return `${nameParts[0].toLowerCase().replaceAll(".", "")}@example.com`;
    }

    if (nameParts[0].length === 2 && nameParts[1].length > 2) {
        return `${nameParts[1].toLowerCase().replaceAll(".", "")}@example.com`;
    }

    return `${nameParts[0].toLowerCase().replaceAll(".", "")}@example.com`;
};

export default function SlideSharing({ userSet, onDone = () => {} }) {
    const [visible, setVisible] = useState(1);
    const [typedEmail, setTypedEmail] = useState("");
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        const timers = [];
        const t = (fn, ms) => {
            const id = setTimeout(fn, ms);
            timers.push(id);
        };

        if (userSet.length < 3) {
            for (let i = 0; i < 3 - userSet.length; i++) {
                userSet.push(userSet[0]);
            }
        }

        const EMAIL_1 = makeEmail(userSet[1].name);
        const EMAIL_2 = makeEmail(userSet[2].name);

        const startDelay = 800;
        const betweenDelay = 600;
        const clickDelay = 400;

        // type first email
        EMAIL_1.split("").forEach((_, i) => {
            t(
                () => setTypedEmail(EMAIL_1.slice(0, i + 1)),
                startDelay + i * 60,
            );
        });

        const afterEmail1 = startDelay + EMAIL_1.length * 60;

        t(() => setButtonPressed(true), afterEmail1 + clickDelay);
        t(
            () => {
                setButtonPressed(false);
                setVisible(2);
                setTypedEmail("");
            },
            afterEmail1 + clickDelay + 300,
        );

        const afterFirstUser = afterEmail1 + clickDelay + 300 + betweenDelay;

        EMAIL_2.split("").forEach((_, i) => {
            t(
                () => setTypedEmail(EMAIL_2.slice(0, i + 1)),
                afterFirstUser + i * 60,
            );
        });

        const afterEmail2 = afterFirstUser + EMAIL_2.length * 60;

        t(() => setButtonPressed(true), afterEmail2 + clickDelay);
        t(
            () => {
                setButtonPressed(false);
                setVisible(3);
                setTypedEmail("");
            },
            afterEmail2 + clickDelay + 300,
        );
        t(() => onDone(), afterEmail2 + clickDelay + 300 + betweenDelay);

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 w-10/12 text-xs">
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-text-dark">
                    {text.editSharedWith}
                </div>
            </div>
            <div className="flex gap-2 mb-3">
                <div className="flex-1 min-w-0 border border-surface-200 rounded-lg px-3 py-1.5 bg-surface-50 text-xs overflow-hidden whitespace-nowrap">
                    {typedEmail.length > 0 ? (
                        <span className="text-text-dark">
                            {typedEmail}
                            <span className="inline-block w-px h-3 bg-text-dark align-middle animate-pulse" />
                        </span>
                    ) : (
                        <span className="text-text-light">
                            {text.enterEmailAddress}
                        </span>
                    )}
                </div>
                <motion.button
                    className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs"
                    animate={buttonPressed ? { scale: 0.93 } : { scale: 1 }}
                    transition={{ duration: 0.1 }}
                    tabIndex={-1}
                >
                    {text.add}
                </motion.button>
            </div>
            <div className="flex flex-col divide-y divide-surface-200">
                {userSet.map((u, i) => (
                    <div
                        key={u.initials}
                        className="flex items-center gap-2 py-2"
                        style={{
                            opacity: i < visible ? 1 : 0,
                            transform:
                                i < visible
                                    ? "translateY(0)"
                                    : "translateY(8px)",
                            transition: "opacity 0.4s, transform 0.4s",
                        }}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs ${u.bg} ${u.text}`}
                        >
                            {u.initials}
                        </div>
                        <span className="text-text-dark text-xs">{u.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
