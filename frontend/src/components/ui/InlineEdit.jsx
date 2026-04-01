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
}) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleSave = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || trimmed === value) {
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
            className={`text-left ${hoverEffects ? "hover:opacity-70 transition-opacity" : ""} ${className}`}
        >
            {/* Value followed by pencil icon (e.g. "John Doe ✏️") */}
            {displayMode === enums.inlineEditDisplayMode.valueWithPencil && (
                <div className="flex items-center gap-1.5">
                    <span className="text-text-dark">{value}</span>
                    <Pencil size={11} className="text-text-light" />
                </div>
            )}
            {/* Value only (e.g. "John Doe") */}
            {displayMode === enums.inlineEditDisplayMode.valueOnly && (
                <span className="text-text-dark">{value}</span>
            )}
            {/* Edit <valueName> (e.g. "Edit Name") */}
            {displayMode === enums.inlineEditDisplayMode.editWithValueName && (
                <span className="text-text-dark">
                    {text.editLabel(valueName)}
                </span>
            )}
        </button>
    );
}

export default InlineEdit;
