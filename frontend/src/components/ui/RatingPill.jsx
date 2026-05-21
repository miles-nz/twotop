import { Utensils, GlassWater, Armchair } from "lucide-react";

export function RatingPill({ icon: Icon, value }) {
    if (!value) return null;
    const full = Math.floor(value);
    const half = value % 1 >= 0.5;
    const stars = "★".repeat(full) + (half ? "\u00BD" : "");
    return (
        <span className="flex items-baseline gap-px text-xs text-text-light">
            {stars}{" "}
            <Icon
                size={10}
                strokeWidth={2.5}
                className="shrink-0 translate-y-px"
            />
        </span>
    );
}

export function RestaurantRatings({ ratings }) {
    if (!ratings) return null;
    const pills = [
        { icon: Utensils, value: ratings.food },
        { icon: GlassWater, value: ratings.drink },
        { icon: Armchair, value: ratings.ambience },
    ].filter((p) => p.value);
    if (pills.length === 0) return null;
    return (
        <div className="flex items-center gap-2 select-none">
            {pills.map((pill, i) => (
                <RatingPill
                    key={pill.icon.displayName}
                    icon={pill.icon}
                    value={pill.value}
                />
            ))}
        </div>
    );
}
