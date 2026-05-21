import { useState } from "react";
import { MapPin, MapPinPen, Trash2, Check } from "lucide-react";
import { text } from "../../resources";
import { formatSuburb } from "../../utils";
import { RestaurantRatings } from "../ui/RatingPill";

export default function RestaurantRow({
    restaurant,
    index,
    canEdit,
    onRemove,
    isChecklist,
    onCheck,
    onAddressUpdate,
    ratings,
    showRatings,
}) {
    const [editingAddress, setEditingAddress] = useState(false);
    const [addressInput, setAddressInput] = useState(
        restaurant.restaurant_address || "",
    );
    const [saving, setSaving] = useState(false);

    const handleSaveAddress = async () => {
        setSaving(true);
        await onAddressUpdate(restaurant.id, addressInput.trim());
        setSaving(false);
        setEditingAddress(false);
    };

    const hasAddress = !!restaurant.restaurant_address;
    const hasPlaceId = !!restaurant.place_id;

    return (
        <div className="flex items-center justify-between gap-2 py-2 pr-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {isChecklist && (
                    <button
                        onClick={() =>
                            onCheck(restaurant.id, !restaurant.checked)
                        }
                        className={`shrink-0 w-4 h-4 rounded border transition-colors ${
                            restaurant.checked
                                ? "bg-secondary-500 border-secondary-500"
                                : "border-surface-300 hover:border-secondary-400"
                        } ${!canEdit ? "cursor-default pointer-events-none" : ""}`}
                        aria-label={
                            restaurant.checked ? text.uncheck : text.check
                        }
                        disabled={!canEdit}
                    >
                        {restaurant.checked && (
                            <Check size={10} className="text-white m-auto" />
                        )}
                    </button>
                )}
                <span className="text-sm font-medium text-text-light shrink-0 w-5 text-center">
                    {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                    <div
                        className={`text-sm font-medium truncate ${
                            isChecklist && restaurant.checked
                                ? "text-text-light"
                                : "text-text-dark"
                        }`}
                    >
                        {restaurant.restaurant_name}
                        {hasAddress &&
                            !editingAddress &&
                            (hasPlaceId ? (
                                <a
                                    href={text.makeGoogleMapsLink(
                                        restaurant.restaurant_name,
                                        restaurant.place_id,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sm:hidden font-normal text-text-light hover:text-secondary-500 transition-colors ml-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    ·{" "}
                                    {formatSuburb(
                                        restaurant.restaurant_address,
                                    )}
                                </a>
                            ) : canEdit ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAddressInput(
                                            restaurant.restaurant_address,
                                        );
                                        setEditingAddress(true);
                                    }}
                                    className="sm:hidden font-normal text-text-light hover:text-secondary-500 transition-colors ml-1"
                                >
                                    ·{" "}
                                    {formatSuburb(
                                        restaurant.restaurant_address,
                                    )}
                                </button>
                            ) : (
                                <span className="sm:hidden font-normal text-text-light ml-1">
                                    ·{" "}
                                    {formatSuburb(
                                        restaurant.restaurant_address,
                                    )}
                                </span>
                            ))}
                    </div>

                    {/* Address display - desktop only */}
                    {hasAddress &&
                        !editingAddress &&
                        (hasPlaceId ? (
                            <a
                                href={text.makeGoogleMapsLink(
                                    restaurant.restaurant_name,
                                    restaurant.place_id,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-1 text-xs text-text-light hover:text-secondary-500 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin size={10} className="shrink-0" />
                                {restaurant.restaurant_address}
                            </a>
                        ) : canEdit ? (
                            <button
                                onClick={() => {
                                    setAddressInput(
                                        restaurant.restaurant_address,
                                    );
                                    setEditingAddress(true);
                                }}
                                className="hidden sm:flex items-center gap-1 text-xs text-text-light hover:text-secondary-500 transition-colors"
                            >
                                <MapPinPen size={10} className="shrink-0" />
                                {restaurant.restaurant_address}
                            </button>
                        ) : (
                            <p className="hidden sm:flex items-center gap-1 text-xs text-text-light">
                                <MapPinPen size={10} className="shrink-0" />
                                {restaurant.restaurant_address}
                            </p>
                        ))}

                    {/* Ratings - mobile only */}
                    {showRatings && ratings?.[restaurant.place_id] && (
                        <div className="sm:hidden mt-0.5">
                            <RestaurantRatings
                                ratings={ratings[restaurant.place_id]}
                            />
                        </div>
                    )}

                    {/* Add/Edit address affordance for manual entries */}
                    {!hasAddress &&
                        !editingAddress &&
                        canEdit &&
                        !hasPlaceId && (
                            <button
                                onClick={() => {
                                    setAddressInput("");
                                    setEditingAddress(true);
                                }}
                                className="text-xs text-text-light hover:text-secondary-500 transition-colors"
                            >
                                {text.addAddress}
                            </button>
                        )}

                    {/* Inline address input */}
                    {editingAddress && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <input
                                autoFocus
                                type="text"
                                value={addressInput}
                                onChange={(e) =>
                                    setAddressInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveAddress();
                                    if (e.key === "Escape")
                                        setEditingAddress(false);
                                }}
                                placeholder={text.addressPlaceholder}
                                className="text-xs border border-surface-300 rounded px-2 py-1 bg-surface-50 focus:outline-none focus:ring-1 focus:ring-secondary-400 text-text-dark w-40 sm:w-56"
                            />
                            <button
                                onClick={handleSaveAddress}
                                disabled={saving}
                                className="text-xs text-secondary-500 hover:text-secondary-600 disabled:opacity-40 transition-colors"
                            >
                                {saving ? text.saving : text.save}
                            </button>
                            <button
                                onClick={() => setEditingAddress(false)}
                                className="text-xs text-text-light hover:text-text-dark transition-colors"
                            >
                                {text.cancel}
                            </button>
                        </div>
                    )}
                </div>

                {/* Ratings - desktop only */}
                {showRatings && ratings?.[restaurant.place_id] && (
                    <div className="hidden sm:flex shrink-0">
                        <RestaurantRatings
                            ratings={ratings[restaurant.place_id]}
                        />
                    </div>
                )}
            </div>

            {canEdit && (
                <button
                    onClick={() => onRemove(restaurant.id)}
                    className="p-1.5 rounded-full text-text-light hover:text-error-500 hover:bg-error-100 transition-colors shrink-0"
                    aria-label={text.removeLabel(restaurant.restaurant_name)}
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}
