import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Search, X } from "lucide-react";
import { text } from "../../resources";
import { useTypingPlaceholder } from "../../hooks/useTypingPlaceholder";

const DEBOUNCE_MS = 300;

function PlacesSearch({
    value: controlledValue,
    onChange: controlledOnChange,
    onClearPlace,
    selectedPlaceId,
    resetOnSelect = false,
    showTypingPlaceholder = true,
    onPlaceSelected,
    onManualAdd,
    className = "",
}) {
    const { getAccessTokenSilently } = useAuth0();
    const [internalValue, setInternalValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const placeholder = useTypingPlaceholder();

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleChange = (e) => {
        const val = e.target.value;
        if (isControlled) {
            controlledOnChange(val);
        } else {
            setInternalValue(val);
        }

        clearTimeout(debounceRef.current);

        if (!val.trim()) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setOpen(true);
            setSearchError(false);
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/places/search?q=${encodeURIComponent(val)}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const data = await response.json();
                if (!response.ok) throw new Error();
                setSuggestions(data);
                setOpen(true);
            } catch (err) {
                console.error("Places search error:", err);
                setSearchError(true);
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);
    };

    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    const handleSelect = async (suggestion) => {
        setOpen(false);
        setSuggestions([]);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/places/details?place_id=${suggestion.place_id}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (resetOnSelect) {
                setInternalValue("");
                onPlaceSelected({
                    name: data.name,
                    address: data.address,
                    place_id: data.place_id,
                });
            } else {
                onPlaceSelected(data.name, data.address, data.place_id);
            }
        } catch (err) {
            console.error("Places details error:", err);
            if (resetOnSelect) {
                setInternalValue("");
                onPlaceSelected({
                    name: suggestion.name,
                    address: suggestion.address,
                    place_id: suggestion.place_id,
                });
            } else {
                onPlaceSelected(
                    suggestion.name,
                    suggestion.address,
                    suggestion.place_id,
                );
            }
        }
    };

    const handleManualAdd = () => {
        const name = value.trim();
        if (!name || !onManualAdd) return;
        setOpen(false);
        setSuggestions([]);
        if (resetOnSelect) setInternalValue("");
        onManualAdd(name);
    };

    const handleClear = () => {
        onClearPlace?.();
        setSuggestions([]);
        setOpen(false);
    };

    const showManualAdd = !!onManualAdd && value.trim().length > 0;

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none"
                />
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    maxLength={100}
                    className={`${className} pl-8`}
                    placeholder={
                        showTypingPlaceholder
                            ? text.restaurantNamePlaceholder(placeholder)
                            : text.searchRestaurant
                    }
                    autoComplete="off"
                />
                {selectedPlaceId && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-mid transition-colors"
                        aria-label={text.clearPlace}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {(open || showManualAdd) && (
                <ul className="absolute z-50 w-full bg-surface-50 border border-surface-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {open && (
                        <>
                            {searchError ? (
                                <li className="px-4 py-2 text-sm text-text-light">
                                    {text.searchError}
                                </li>
                            ) : loading ? (
                                <li className="px-4 py-2 text-sm text-text-light">
                                    {text.searchingPlaces}
                                </li>
                            ) : suggestions.length === 0 ? (
                                <li className="px-4 py-2 text-sm text-text-light">
                                    {text.noPlacesFound}
                                </li>
                            ) : (
                                suggestions.map((s) => (
                                    <li key={s.place_id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onClick={() => handleSelect(s)}
                                            className="w-full text-left px-4 py-2 hover:bg-surface-100 transition-colors"
                                        >
                                            <span className="block text-sm text-text-dark">
                                                {s.name}
                                            </span>
                                            <span className="block text-xs text-text-light">
                                                {s.address}
                                            </span>
                                        </button>
                                    </li>
                                ))
                            )}
                        </>
                    )}
                    {showManualAdd && (
                        <li
                            className={
                                open ? "border-t border-surface-200" : ""
                            }
                        >
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleManualAdd}
                                className="w-full text-left px-4 py-2 hover:bg-surface-100 transition-colors"
                            >
                                <span className="block text-sm text-secondary-500">
                                    {text.addManualRestaurant(value.trim())}
                                </span>
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default PlacesSearch;
