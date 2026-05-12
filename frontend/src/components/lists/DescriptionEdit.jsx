import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { text } from "../../resources";
import { useAutoResize } from "../../hooks/useAutoResize";

export default function DescriptionEdit({ value, onSave }) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const descriptionRef = useRef(null);
    useAutoResize(descriptionRef, inputValue, { shrinkOnBlur: false });

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (editing && descriptionRef.current) {
            descriptionRef.current.focus();
            descriptionRef.current.style.height = "auto";
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
    }, [editing]);

    const handleSave = () => {
        onSave(inputValue.trim());
        setEditing(false);
    };

    const handleCancel = () => {
        setInputValue(value);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex flex-col gap-2">
                <textarea
                    ref={descriptionRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={text.listDescriptionPlaceholder}
                    rows={1}
                    className="text-sm border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-light placeholder-text-light resize-none overflow-hidden w-full"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancel();
                    }}
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className="text-xs text-secondary-500 hover:text-secondary-600 transition-colors"
                    >
                        {text.save}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-xs text-text-light hover:text-text-dark transition-colors"
                    >
                        {text.cancel}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 group">
            {value ? (
                <>
                    <p className="text-sm text-text-light">{value}</p>
                    <button
                        onClick={() => setEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-light hover:text-text-dark"
                        aria-label={text.editLabel(text.listDescriptionLabel)}
                    >
                        <Pencil size={12} />
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-text-light hover:text-text-dark transition-colors"
                >
                    + {text.addDescription}
                </button>
            )}
        </div>
    );
}
