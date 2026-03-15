import { useAuth0 } from "@auth0/auth0-react";
import {
    MoreHorizontal,
    Trash2,
    Eye,
    EyeOff,
    ImagePlus,
    Pencil,
    Store,
} from "lucide-react";
import { useReviewList } from "../../contexts/ReviewListContext";
import { text } from "../../resources";
import { createPortal } from "react-dom";
import { useRef, useState, useEffect } from "react";

function ReviewCardMenu({
    review,
    onAddPhotos,
    onEditReview,
    onEditName,
    onDelete,
    onReviewUpdated,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const { openMenuId, handleMenuOpen, handleMenuClose } = useReviewList();
    const menuOpen = openMenuId === review.id;
    const buttonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const handleOpenMenu = (e) => {
        e.stopPropagation();
        if (!menuOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom,
                left: rect.right - 192,
            });
        }
        menuOpen ? handleMenuClose() : handleMenuOpen(review.id);
    };

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = () => handleMenuClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect) {
                setMenuPosition({
                    top: rect.bottom,
                    left: rect.right - 192,
                });
            }
        };
        window.addEventListener("scroll", updatePosition);
        return () => window.removeEventListener("scroll", updatePosition);
    }, [menuOpen]);

    const handleTogglePublic = async () => {
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("is_public", !review.is_public);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${review.id}`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            if (!response.ok) throw new Error("Failed to update");
            onReviewUpdated();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpenMenu}
                className="flex items-center text-text-light hover:text-text-mid cursor-pointer transition-colors"
            >
                <MoreHorizontal size={18} />
            </button>
            {menuOpen &&
                createPortal(
                    <div
                        className="fixed bg-surface-50 border border-surface-200 rounded-lg shadow-lg z-40 w-48"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <button
                            onClick={() => {
                                handleMenuClose();
                                onEditName();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 rounded-t-lg cursor-pointer"
                        >
                            <Store size={14} />
                            {text.updateRestaurant}
                        </button>
                        <button
                            onClick={() => {
                                handleMenuClose();
                                onEditReview();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 cursor-pointer"
                        >
                            <Pencil size={14} />
                            {text.editReview}
                        </button>
                        <button
                            onClick={() => {
                                handleMenuClose();
                                onAddPhotos();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 cursor-pointer"
                        >
                            <ImagePlus size={14} />
                            {review.image_urls && review.image_urls.length > 0
                                ? text.editPhotos
                                : text.addPhotos}
                        </button>
                        <button
                            onClick={() => {
                                handleMenuClose();
                                handleTogglePublic();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-dark hover:bg-surface-100 cursor-pointer"
                        >
                            {review.is_public ? (
                                <EyeOff size={14} />
                            ) : (
                                <Eye size={14} />
                            )}
                            {review.is_public
                                ? text.makePrivate
                                : text.makePublic}
                        </button>
                        <button
                            onClick={() => {
                                handleMenuClose();
                                onDelete();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error-600 hover:bg-surface-100 rounded-b-lg cursor-pointer"
                        >
                            <Trash2 size={14} />
                            {text.delete}
                        </button>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

export default ReviewCardMenu;
