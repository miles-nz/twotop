import {
    Bold,
    Italic,
    Quote,
    List,
    ListOrdered,
    CaseLower,
} from "lucide-react";

function MarkdownToolbar({ textareaRef, value, onChange }) {
    const wrapSelection = (prefix, suffix = prefix) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.slice(start, end);
        const newText =
            value.slice(0, start) +
            prefix +
            selected +
            suffix +
            value.slice(end);
        onChange(newText);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const wrapLine = (prefix) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const alreadyApplied = value.slice(lineStart).startsWith(prefix);
        const newText = alreadyApplied
            ? value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
            : value.slice(0, lineStart) + prefix + value.slice(lineStart);
        onChange(newText);
        setTimeout(() => el.focus(), 0);
    };

    const insertList = (prefix) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.slice(start, end);

        let newText;
        if (selected) {
            // Prefix each selected line
            const lines = selected
                .split("\n")
                .map((line) => `${prefix}${line}`);
            newText =
                value.slice(0, start) + lines.join("\n") + value.slice(end);
        } else {
            // Insert a new list item at the current line
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const alreadyApplied = value.slice(lineStart).startsWith(prefix);
            newText = alreadyApplied
                ? value.slice(0, lineStart) +
                  value.slice(lineStart + prefix.length)
                : value.slice(0, lineStart) + prefix + value.slice(lineStart);
        }

        onChange(newText);
        setTimeout(() => el.focus(), 0);
    };

    const buttonClass =
        "text-text-light hover:text-text-mid transition-colors p-1 rounded";

    return (
        <div className="flex gap-1 mb-1">
            <button
                type="button"
                onClick={() => wrapSelection("**")}
                className={buttonClass}
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <button
                type="button"
                onClick={() => wrapSelection("*")}
                className={buttonClass}
                title="Italic"
            >
                <Italic size={14} />
            </button>
            <button
                type="button"
                onClick={() => wrapLine("> ")}
                className={buttonClass}
                title="Quote"
            >
                <Quote size={14} />
            </button>
            <button
                type="button"
                onClick={() => wrapSelection("<caption>", "</caption>")}
                className={buttonClass}
                title="Caption"
            >
                <CaseLower size={14} />
            </button>
            <button
                type="button"
                onClick={() => insertList("- ")}
                className={buttonClass}
                title="Bullet list"
            >
                <List size={14} />
            </button>
            <button
                type="button"
                onClick={() => insertList("1. ")}
                className={buttonClass}
                title="Numbered list"
            >
                <ListOrdered size={14} />
            </button>
        </div>
    );
}

export default MarkdownToolbar;
