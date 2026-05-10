import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
    ArrowLeft,
    Trash2,
    LogOut,
    Share2,
    Pencil,
    MapPin,
} from "lucide-react";
import { text, enums } from "../resources";
import InlineEdit from "../components/ui/InlineEdit";
import PlacesSearch from "../components/ui/PlacesSearch";
import SortableItem from "../components/ui/SortableItem";
import useSortableList from "../hooks/useSortableList";
import ShareListModal from "../components/modals/ShareListModal";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { useTheme } from "../contexts/ThemeContext";
import LoadingDots from "../components/ui/LoadingDots";
import { useAutoResize } from "../hooks/useAutoResize";
import { formatShortAddress } from "../utils";
import { useUser } from "../contexts/UserContext";

export default function ListDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently, user } = useAuth0();
    const { currentUserName, currentUserPicture } = useUser();

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);

    const isOwner = list?.permission === "owner";
    const canEdit = isOwner || list?.permission === "edit";

    const { currentThemeId } = useTheme();

    const {
        items: restaurants,
        setItems: setRestaurants,
        dragIndex,
        overIndex,
        dragY,
        getMouseHandlers,
        getTouchHandlers,
        setItemRef,
    } = useSortableList([]);

    const prevRestaurants = useRef(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/lists`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                const found = data.find((l) => l.id === id);
                if (!found) {
                    navigate("/lists");
                    return;
                }
                setList(found);
                setRestaurants(found.restaurants ?? []);
            }
        } catch (err) {
            console.error("Failed to fetch list:", err);
        } finally {
            setLoading(false);
        }
    }, [id, getAccessTokenSilently, navigate]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    useEffect(() => {
        if (!canEdit || !list) return;
        if (dragIndex !== null) {
            prevRestaurants.current = restaurants;
            return;
        }
        if (!prevRestaurants.current) return;
        const changed = restaurants.some(
            (r, i) => r.id !== prevRestaurants.current[i]?.id,
        );
        if (!changed) {
            prevRestaurants.current = null;
            return;
        }
        prevRestaurants.current = null;
        saveReorder(restaurants);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragIndex]);

    const saveReorder = async (ordered) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/restaurants/reorder`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        order: ordered.map((r, i) => ({
                            id: r.id,
                            position: i,
                        })),
                    }),
                },
            );
        } catch (err) {
            console.error("Failed to save reorder:", err);
        }
    };

    const handleSaveName = async (newName) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newName }),
                },
            );
            const data = await res.json();
            if (res.ok) setList((prev) => ({ ...prev, name: data.name }));
        } catch (err) {
            console.error("Failed to save name:", err);
        }
    };

    const handleSaveDescription = async (newDescription) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ description: newDescription }),
                },
            );
            const data = await res.json();
            if (res.ok)
                setList((prev) => ({
                    ...prev,
                    description: data.description,
                }));
        } catch (err) {
            console.error("Failed to save description:", err);
        }
    };

    const handleAddRestaurant = async (place) => {
        if (!place) return;
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/restaurants`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        place_id: place.place_id || null,
                        restaurant_name: place.name,
                        restaurant_address: place.address || null,
                    }),
                },
            );
            const data = await res.json();
            if (res.ok) {
                setRestaurants((prev) => [...prev, data]);
            }
        } catch (err) {
            console.error("Failed to add restaurant:", err);
        }
    };

    const handleRemoveRestaurant = async (restaurantId) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/restaurants/${restaurantId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) {
                setRestaurants((prev) =>
                    prev.filter((r) => r.id !== restaurantId),
                );
            }
        } catch (err) {
            console.error("Failed to remove restaurant:", err);
        }
    };

    const handleDeleteList = async () => {
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) navigate("/lists");
        } catch (err) {
            console.error("Failed to delete list:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleLeaveList = async () => {
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/share/${user.sub}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) navigate("/lists");
        } catch (err) {
            console.error("Failed to leave list:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto pt-11 pb-24 px-4 sm:px-6 lg:px-0 flex justify-center py-12">
                <LoadingDots logoColours={currentThemeId === "default-theme"} />
            </div>
        );
    }

    if (!list) return null;

    return (
        <div className="max-w-3xl mx-auto pt-4 pb-24 px-4 sm:px-6 lg:px-0">
            <LoadingOverlay isVisible={saving} />

            {/* Header */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigate("/lists")}
                        className="p-1.5 text-text-light hover:text-text-dark transition-colors cursor-pointer"
                        aria-label={text.back}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => setShareModalOpen(true)}
                                className="p-1.5 text-text-light hover:text-text-dark transition-colors cursor-pointer"
                                aria-label={text.shareList}
                                title={text.shareList}
                            >
                                <Share2 size={20} />
                            </button>
                        )}
                        {isOwner && (
                            <>
                                {confirmDelete ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-light">
                                            {text.confirmDeleteList}
                                        </span>
                                        <button
                                            onClick={handleDeleteList}
                                            className="text-xs text-error-500 hover:underline cursor-pointer"
                                        >
                                            {text.yes}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setConfirmDelete(false)
                                            }
                                            className="text-xs text-text-light hover:underline cursor-pointer"
                                        >
                                            {text.cancel}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="p-1.5 text-text-light hover:text-error-500 transition-colors cursor-pointer"
                                        aria-label={text.deleteList}
                                        title={text.deleteList}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </>
                        )}
                        {!isOwner && (
                            <>
                                {confirmLeave ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-light">
                                            {text.confirmLeaveList}
                                        </span>
                                        <button
                                            onClick={handleLeaveList}
                                            className="text-xs text-error-500 hover:underline cursor-pointer"
                                        >
                                            {text.yes}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setConfirmLeave(false)
                                            }
                                            className="text-xs text-text-light hover:underline cursor-pointer"
                                        >
                                            {text.cancel}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmLeave(true)}
                                        className="p-1.5 text-text-light hover:text-error-500 transition-colors cursor-pointer"
                                        aria-label={text.leaveList}
                                        title={text.leaveList}
                                    >
                                        <LogOut size={20} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {isOwner ? (
                    <InlineEdit
                        value={list.name}
                        onSave={handleSaveName}
                        className="text-2xl font-bold text-text-dark"
                        inputClassName="text-2xl font-bold text-text-dark w-full"
                        displayMode={
                            enums.inlineEditDisplayMode.valueWithPencil
                        }
                        valueName={text.listNameLabel}
                        hoverEffects={true}
                        showConfirmButton={true}
                    />
                ) : (
                    <h1 className="text-2xl font-bold text-text-dark">
                        {list.name}
                    </h1>
                )}

                {isOwner ? (
                    <DescriptionEdit
                        value={list.description || ""}
                        onSave={handleSaveDescription}
                    />
                ) : (
                    list.description && (
                        <p className="text-sm text-text-light">
                            {list.description}
                        </p>
                    )
                )}
            </div>

            {canEdit && (
                <div className="mb-6">
                    <PlacesSearch
                        onPlaceSelected={handleAddRestaurant}
                        resetOnSelect={true}
                        showTypingPlaceholder={false}
                        className="w-full text-sm border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark"
                    />
                </div>
            )}

            {restaurants.length === 0 ? (
                <p className="text-sm text-text-light text-center py-8">
                    {canEdit ? text.noRestaurantsEdit : text.noRestaurantsView}
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {restaurants.map((restaurant, index) =>
                        canEdit ? (
                            <SortableItem
                                key={restaurant.id}
                                index={index}
                                dragIndex={dragIndex}
                                overIndex={overIndex}
                                dragY={dragY}
                                getMouseHandlers={getMouseHandlers}
                                getTouchHandlers={getTouchHandlers}
                                setItemRef={setItemRef}
                            >
                                <RestaurantRow
                                    restaurant={restaurant}
                                    index={index}
                                    canEdit={canEdit}
                                    onRemove={handleRemoveRestaurant}
                                />
                            </SortableItem>
                        ) : (
                            <div
                                key={restaurant.id}
                                className="flex items-center gap-3 rounded-lg bg-surface-50 border border-surface-200 px-4 py-3"
                            >
                                <RestaurantRow
                                    restaurant={restaurant}
                                    index={index}
                                    canEdit={false}
                                    onRemove={handleRemoveRestaurant}
                                />
                            </div>
                        ),
                    )}
                </div>
            )}

            {shareModalOpen && (
                <ShareListModal
                    listId={id}
                    listName={list.name}
                    shares={list.shares}
                    isOwner={isOwner}
                    ownerId={list.user_id}
                    ownerName={isOwner ? currentUserName : list.owner_name}
                    ownerPicture={
                        isOwner ? currentUserPicture : list.owner_picture
                    }
                    onClose={() => setShareModalOpen(false)}
                    getAccessTokenSilently={getAccessTokenSilently}
                />
            )}
        </div>
    );
}

function RestaurantRow({ restaurant, index, canEdit, onRemove }) {
    return (
        <div className="flex items-center justify-between gap-2 py-2 pr-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-medium text-text-light shrink-0 w-5 text-right">
                    {index + 1}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-dark truncate">
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

function DescriptionEdit({ value, onSave }) {
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
                        className="text-xs text-secondary-500 hover:text-secondary-600 transition-colors cursor-pointer"
                    >
                        {text.save}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-xs text-text-light hover:text-text-dark transition-colors cursor-pointer"
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-light hover:text-text-dark cursor-pointer"
                        aria-label={text.editLabel(text.listDescriptionLabel)}
                    >
                        <Pencil size={12} />
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-text-light hover:text-text-dark transition-colors cursor-pointer"
                >
                    + {text.addDescription}
                </button>
            )}
        </div>
    );
}
