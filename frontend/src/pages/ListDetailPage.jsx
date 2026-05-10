import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { text, enums } from "../resources";
import InlineEdit from "../components/ui/InlineEdit";
import PlacesSearch from "../components/ui/PlacesSearch";
import SortableItem from "../components/lists/SortableItem";
import useSortableList from "../hooks/useSortableList";
import ShareListModal from "../components/lists/ShareListModal";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { useTheme } from "../contexts/ThemeContext";
import LoadingDots from "../components/ui/LoadingDots";
import { useUser } from "../contexts/UserContext";
import RestaurantRow from "../components/lists/RestaurantRow";
import DescriptionEdit from "../components/lists/DescriptionEdit";
import ListDetailHeader from "../components/lists/ListDetailHeader";

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
            if (res.ok) setRestaurants((prev) => [data, ...prev]);
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
            if (res.ok)
                setRestaurants((prev) =>
                    prev.filter((r) => r.id !== restaurantId),
                );
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

    const handleToggleChecklist = async () => {
        const newValue = !list.is_checklist;
        setList((prev) => ({ ...prev, is_checklist: newValue }));
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${import.meta.env.VITE_API_URL}/lists/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_checklist: newValue }),
            });
        } catch (err) {
            console.error("Failed to toggle checklist:", err);
            setList((prev) => ({ ...prev, is_checklist: !newValue }));
        }
    };

    const handleCheck = async (restaurantId, checked) => {
        setRestaurants((prev) =>
            prev.map((r) => (r.id === restaurantId ? { ...r, checked } : r)),
        );
        try {
            const token = await getAccessTokenSilently();
            await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/restaurants/${restaurantId}/check`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ checked }),
                },
            );
        } catch (err) {
            console.error("Failed to update check state:", err);
            setRestaurants((prev) =>
                prev.map((r) =>
                    r.id === restaurantId ? { ...r, checked: !checked } : r,
                ),
            );
        }
    };

    const handleSortChecked = async () => {
        const unchecked = restaurants.filter((r) => !r.checked);
        const checked = restaurants.filter((r) => r.checked);
        setRestaurants([...unchecked, ...checked]);
        try {
            const token = await getAccessTokenSilently();
            await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${id}/restaurants/sort-checked`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
        } catch (err) {
            console.error("Failed to sort checked items:", err);
            setRestaurants(restaurants);
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

            <div className="flex flex-col gap-3 mb-6">
                <ListDetailHeader
                    isOwner={isOwner}
                    canEdit={canEdit}
                    isChecklist={list.is_checklist}
                    confirmDelete={confirmDelete}
                    confirmLeave={confirmLeave}
                    onBack={() => navigate("/lists")}
                    onShare={() => setShareModalOpen(true)}
                    onToggleChecklist={handleToggleChecklist}
                    onDeleteConfirm={() => setConfirmDelete(true)}
                    onDeleteCancel={() => setConfirmDelete(false)}
                    onDelete={handleDeleteList}
                    onLeaveConfirm={() => setConfirmLeave(true)}
                    onLeaveCancel={() => setConfirmLeave(false)}
                    onLeave={handleLeaveList}
                    onSortChecked={handleSortChecked}
                    hasCheckedItems={restaurants.some((r) => r.checked)}
                />

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
                                    isChecklist={list.is_checklist}
                                    onCheck={handleCheck}
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
                                    isChecklist={list.is_checklist}
                                    onCheck={handleCheck}
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
