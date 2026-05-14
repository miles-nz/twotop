import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingDots from "../components/ui/LoadingDots";
import { useTheme } from "../contexts/ThemeContext";
import { text } from "../resources";
import { Check } from "lucide-react";
import LinkedAvatar from "../components/ui/LinkedAvatar";

export default function SharedListPage() {
    const { token } = useParams();
    const { currentThemeId } = useTheme();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/lists/shared/${token}`,
                );
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                const data = await res.json();
                setList(data);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [token]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 flex justify-center py-12">
                <LoadingDots logoColours={currentThemeId === "default-theme"} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-16 px-4">
                <div className="bg-surface-50 rounded-2xl shadow-md p-6 text-center border border-surface-200">
                    <p className="text-text-mid">{text.listNotFound}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-0">
            <div className="mb-6">
                <div className="flex items-start justify-between gap-3 px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-dark">
                            {list.name}
                        </h1>
                        {list.description && (
                            <p className="text-sm text-text-light mt-1">
                                {list.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                        <LinkedAvatar
                            name={list.owner_name}
                            picture={list.owner_picture}
                            size="sm"
                            userId={list.owner_user_id}
                            nameSide="left"
                        />
                    </div>
                </div>
            </div>

            {list.restaurants.length === 0 ? (
                <p className="text-sm text-text-light text-center py-8">
                    {text.noRestaurantsView}
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {list.restaurants.map((restaurant, index) => (
                        <div
                            key={restaurant.id}
                            className="flex items-center gap-3 rounded-lg bg-surface-50 border border-surface-200 px-4 py-3"
                        >
                            <span className="text-xs text-text-light shrink-0">
                                {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-text-dark truncate">
                                    {restaurant.restaurant_name}
                                </p>
                                {restaurant.restaurant_address && (
                                    <p className="text-xs text-text-light truncate">
                                        {restaurant.restaurant_address}
                                    </p>
                                )}
                            </div>
                            {list.is_checklist && restaurant.checked && (
                                <Check
                                    size={14}
                                    className="text-secondary-500 shrink-0"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
