import { MapPin, Trash2, Check } from "lucide-react";
import { text } from "../../resources";
import { formatShortAddress } from "../../utils";

export default function RestaurantRow({
    restaurant,
    index,
    canEdit,
    onRemove,
    isChecklist,
    onCheck,
}) {
    return (
        <div className="flex items-center justify-between gap-2 py-2 pr-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0">
                {isChecklist && (
                    <button
                        onClick={() =>
                            onCheck(restaurant.id, !restaurant.checked)
                        }
                        className={`shrink-0 w-4 h-4 rounded border transition-colors cursor-pointer ${
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
                <div className="min-w-0">
                    <p
                        className={`text-sm font-medium truncate ${
                            isChecklist && restaurant.checked
                                ? " text-text-light"
                                : "text-text-dark"
                        }`}
                    >
                        {restaurant.restaurant_name}
                    </p>
                    {restaurant.restaurant_address &&
                        (restaurant.place_id ? (
                            <a
                                href={text.makeGoogleMapsLink(
                                    restaurant.restaurant_name,
                                    restaurant.place_id,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-text-light hover:text-secondary-500 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin size={10} className="shrink-0" />
                                <span className="hidden sm:inline">
                                    {restaurant.restaurant_address}
                                </span>
                                <span className="sm:hidden">
                                    {formatShortAddress(
                                        restaurant.restaurant_address,
                                    )}
                                </span>
                            </a>
                        ) : (
                            <p className="flex items-center gap-1 text-xs text-text-light">
                                <MapPin size={10} className="shrink-0" />
                                <span className="hidden sm:inline">
                                    {restaurant.restaurant_address}
                                </span>
                                <span className="sm:hidden">
                                    {formatShortAddress(
                                        restaurant.restaurant_address,
                                    )}
                                </span>
                            </p>
                        ))}
                </div>
            </div>
            {canEdit && (
                <button
                    onClick={() => onRemove(restaurant.id)}
                    className="p-1.5 rounded-full text-text-light hover:text-error-500 hover:bg-error-100 transition-colors shrink-0 cursor-pointer"
                    aria-label={text.removeLabel(restaurant.restaurant_name)}
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}
