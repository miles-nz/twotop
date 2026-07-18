import { tutorial } from "../../resources";

export default function SlideSetName({ name, setName, nameError, onSkip }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder={tutorial.setNameSlidePlaceholder}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300"
                autoFocus
            />
            {nameError && <p className="text-error-600 text-sm">{nameError}</p>}
            <button
                onClick={onSkip}
                className="text-xs text-text-light hover:text-text-mid transition-colors"
            >
                {tutorial.setNameSkip}
            </button>
        </div>
    );
}
