import { useState, useCallback, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function useNotifications({
    onFriendAccepted,
    onListShareAccepted,
    enabled = true,
} = {}) {
    const { getAccessTokenSilently } = useAuth0();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/notifications`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const data = await res.json();
            if (res.ok) {
                setNotifications(data);
                return data;
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently]);

    useEffect(() => {
        if (enabled) fetchNotifications();
    }, [fetchNotifications, enabled]);

    const markAsRead = useCallback(
        async (id) => {
            try {
                const token = await getAccessTokenSilently();
                await fetch(
                    `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
                    {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                );
            } catch (err) {
                console.error("Failed to mark notification as read:", err);
            }
        },
        [getAccessTokenSilently],
    );

    const markNonActionableAsRead = useCallback(
        async (notifs) => {
            const toMark = notifs.filter(
                (n) =>
                    n.type !== "friend_request" &&
                    n.type !== "list_shared" &&
                    !n.read,
            );
            if (toMark.length === 0) return;
            try {
                const token = await getAccessTokenSilently();
                await fetch(
                    `${import.meta.env.VITE_API_URL}/notifications/read-batch`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ ids: toMark.map((n) => n.id) }),
                    },
                );
                setNotifications((prev) =>
                    prev.map((n) =>
                        toMark.some((t) => t.id === n.id)
                            ? { ...n, read: true }
                            : n,
                    ),
                );

                // If any friend_accepted notifications were marked, refresh friends list
                const hasFriendAccepted = toMark.some(
                    (n) => n.type === "friend_accepted",
                );
                if (hasFriendAccepted) {
                    onFriendAccepted?.();
                }
            } catch (err) {
                console.error("Failed to mark notifications as read:", err);
            }
        },
        [getAccessTokenSilently, onFriendAccepted],
    );

    const resolveRequest = useCallback(
        async (
            requestId,
            action,
            notificationId,
            notificationType = "friend_request",
        ) => {
            try {
                const token = await getAccessTokenSilently();

                if (notificationType === "list_shared") {
                    const endpoint =
                        action === "accept"
                            ? `${import.meta.env.VITE_API_URL}/lists/share/${notificationId}/accept`
                            : `${import.meta.env.VITE_API_URL}/lists/share/${notificationId}/decline`;

                    const res = await fetch(endpoint, {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok)
                        throw new Error("Failed to resolve list share");

                    if (action === "accept") {
                        onListShareAccepted?.();
                    }
                } else {
                    const res = await fetch(
                        `${import.meta.env.VITE_API_URL}/friends/request/${requestId}`,
                        {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ action }),
                        },
                    );
                    if (!res.ok) throw new Error("Failed to resolve request");

                    if (action === "accept") {
                        onFriendAccepted?.();
                    }
                }

                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId
                            ? { ...n, resolved: action, read: true }
                            : n,
                    ),
                );
            } catch (err) {
                console.error("Failed to resolve request:", err);
            }
        },
        [getAccessTokenSilently, onFriendAccepted, onListShareAccepted],
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        markNonActionableAsRead,
        resolveRequest,
        unreadCount,
    };
}
