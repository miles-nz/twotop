import { useState, useEffect } from "react";
import { enums, text } from "../../resources";
import { Check, Pencil } from "lucide-react";

function InlineEdit({
    value,
    onSave,
    onSaveComplete,
    className = "",
    inputClassName = "",
    displayMode = enums.inlineEditDisplayMode.valueOnly,
    hoverEffects = true,
    valueName = "value",
    showConfirmButton = false,
    allowEmpty = false,
    emptyPlaceholder = null,
}) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleSave = () => {
        const trimmed = inputValue.trim();
        if (!allowEmpty && !trimmed) {
            setInputValue(value);
            setEditing(false);
            return;
        }
        if (trimmed === value) {
            setInputValue(value);
            setEditing(false);
            return;
        }
        onSave(trimmed);
        setEditing(false);
        onSaveComplete?.();
    };

    return editing ? (
        <div className="flex items-center gap-1">
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={showConfirmButton ? undefined : handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                        setInputValue(value);
                        setEditing(false);
                    }
                }}
                className={`bg-transparent border-b border-secondary-400 focus:outline-none ${inputClassName}`}
                autoFocus
            />
            {showConfirmButton && (
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSave}
                    className="text-secondary-500 hover:text-secondary-600 transition-colors"
                >
                    <Check size={14} />
                </button>
            )}
        </div>
    ) : (
        <button
            onClick={() => setEditing(true)}
            className={`text-left group ${hoverEffects ? "transition-colors" : ""} ${className}`}
        >
            {/* Value followed by pencil icon */}
            {displayMode === enums.inlineEditDisplayMode.valueWithPencil && (
                <div className="flex items-center gap-1.5">
                    {value ? (
                        <>
                            <span
                                className={`${hoverEffects ? "group-hover:text-secondary-500 transition-colors" : "text-text-dark"}`}
                            >
                                {value}
                            </span>
                            <Pencil
                                size={11}
                                className={`${hoverEffects ? "text-text-light group-hover:text-secondary-500 transition-colors" : "text-text-light"}`}
                            />
                        </>
                    ) : emptyPlaceholder ? (
                        <span className="text-text-light hover:text-text-dark transition-colors text-xs">
                            {emptyPlaceholder}
                        </span>
                    ) : null}
                </div>
            )}
            {/* Value only */}
            {displayMode === enums.inlineEditDisplayMode.valueOnly && (
                <span
                    className={`${hoverEffects ? "group-hover:text-secondary-500 transition-colors" : "text-text-dark"}`}
                >
                    {value || emptyPlaceholder}
                </span>
            )}
            {/* Edit <valueName> */}
            {displayMode === enums.inlineEditDisplayMode.editWithValueName && (
                <span
                    className={`${hoverEffects ? "group-hover:text-secondary-500 transition-colors" : "text-text-dark"}`}
                >
                    {text.editLabel(valueName)}
                </span>
            )}
        </button>
    );
}

export default InlineEdit;
