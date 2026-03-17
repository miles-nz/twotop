// PublicToggle.jsx
import React from "react";
import { text } from "../../resources";

/**
 * PublicToggle
 *
 * Props:
 * - isPublic: boolean (required)
 * - onToggle: function (required)
 * - className: string (optional)
 */
export default function PublicToggle({ isPublic, onToggle, className = "" }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <p className="text-xs text-text-light">Public</p>
            <button
                onClick={() => onToggle(!isPublic)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                    isPublic ? "bg-secondary-500" : "bg-surface-300"
                }`}
                aria-pressed={isPublic}
                aria-label={text.publicOnly}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                />
            </button>
        </div>
    );
}
