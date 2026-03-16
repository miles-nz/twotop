import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function useDeleteReview(reviewId, onReviewUpdated) {
    const { getAccessTokenSilently } = useAuth0();
    const [deleting, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw new Error("Failed to delete");
            onReviewUpdated();
        } catch (err) {
            console.error(err);
            setDeleting(false);
        }
        setConfirmOpen(false);
    };

    return {
        deleting,
        handleDelete,
        confirmOpen,
        setConfirmOpen,
    };
}
