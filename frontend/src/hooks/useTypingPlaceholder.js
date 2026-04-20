import { useEffect, useRef, useState } from "react";
import { placeholders } from "../resources";

const TYPING_SPEED = 60;
const DELETING_SPEED = 30;
const PAUSE_AFTER_TYPING = 1800;
const PAUSE_AFTER_DELETING = 400;

export function useTypingPlaceholder(words = placeholders) {
    const [placeholder, setPlaceholder] = useState("");
    const timeouts = useRef([]);

    useEffect(() => {
        let currentWord = words[Math.floor(Math.random() * words.length)];
        let charIndex = 0;
        let deleting = false;

        const getNextWord = () => {
            const remaining = words.filter((w) => w !== currentWord);
            return remaining[Math.floor(Math.random() * remaining.length)];
        };

        const tick = () => {
            if (!deleting) {
                charIndex++;
                setPlaceholder(currentWord.slice(0, charIndex));
                if (charIndex === currentWord.length) {
                    deleting = true;
                    const id = setTimeout(tick, PAUSE_AFTER_TYPING);
                    timeouts.current.push(id);
                } else {
                    const id = setTimeout(tick, TYPING_SPEED);
                    timeouts.current.push(id);
                }
            } else {
                charIndex--;
                setPlaceholder(currentWord.slice(0, charIndex));
                if (charIndex === 0) {
                    deleting = false;
                    currentWord = getNextWord();
                    const id = setTimeout(tick, PAUSE_AFTER_DELETING);
                    timeouts.current.push(id);
                } else {
                    const id = setTimeout(tick, DELETING_SPEED);
                    timeouts.current.push(id);
                }
            }
        };

        const id = setTimeout(tick, PAUSE_AFTER_DELETING);
        timeouts.current.push(id);

        return () => {
            timeouts.current.forEach(clearTimeout);
            timeouts.current = [];
        };
    }, []);

    return placeholder;
}
