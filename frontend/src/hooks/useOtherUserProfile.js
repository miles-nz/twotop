import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../contexts/UserContext";

export function useOtherUserProfile(userId, isOwnProfile) {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const { sharedWith, preferencesLoaded } = useUser();

    const [otherUser, setOtherUser] = useState(null);
    const [otherUserLoading, setOtherUserLoading] = useState(
        !isOwnProfile && !!userId,
    );
    const [friendStatus, setFriendStatus] = useState("loading");
    const [friendStatusLoading, setFriendStatusLoading] = useState(
        !isOwnProfile && !!userId,
    );
    const [sendingRequest, setSendingRequest] = useState(false);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const [userReviews, setUserReviews] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        if (isOwnProfile || !userId) return;
        const fetchOtherUser = async () => {
            try {
                const headers = {};
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    headers.Authorization = `Bearer ${token}`;
                }
                const fullUserId = `auth0|${userId}`;
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/user/${encodeURIComponent(fullUserId)}`,
                    { headers },
                );
                const data = await res.json();
                if (res.ok) setOtherUser(data);
            } catch {
                // ignore
            } finally {
                setOtherUserLoading(false);
            }
        };
        fetchOtherUser();
    }, [userId, isAuthenticated, isOwnProfile]);

    useEffect(() => {
        if (isOwnProfile || !userId) return;
        if (isAuthenticated && !preferencesLoaded) return;

        const fullUserId = `auth0|${userId}`;
        const isFriend = sharedWith.some((u) => u.user_id === fullUserId);

        if (isFriend) {
            setFriendStatus("friends");
            setFriendStatusLoading(false);
            return;
        }

        if (!isAuthenticated) {
            setFriendStatus("unauthenticated");
            setFriendStatusLoading(false);
            return;
        }

        const checkPending = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/friends/requests/pending`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const data = await res.json();
                if (res.ok) {
                    const isPending = data.some(
                        (r) => r.receiver_id === fullUserId,
                    );
                    setFriendStatus(isPending ? "pending_sent" : null);
                } else {
                    setFriendStatus(null);
                }
            } catch {
                setFriendStatus(null);
            } finally {
                setFriendStatusLoading(false);
            }
        };

        checkPending();
    }, [userId, sharedWith, preferencesLoaded, isAuthenticated, isOwnProfile]);

    const handleSendFriendRequest = async () => {
        setSendingRequest(true);
        try {
            const token = await getAccessTokenSilently();
            const fullUserId = `auth0|${userId}`;
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/friends/request`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id: fullUserId }),
                },
            );
            if (res.ok) setFriendStatus("pending_sent");
        } catch (err) {
            console.error(err);
        } finally {
            setSendingRequest(false);
        }
    };

    const handleToggleReviews = async () => {
        setReviewsOpen((prev) => !prev);
        if (!reviewsOpen && userReviews === null) {
            setReviewsLoading(true);
            try {
                const headers = {};
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    headers.Authorization = `Bearer ${token}`;
                }
                const fullUserId = `auth0|${userId}`;
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/reviews/user/${encodeURIComponent(fullUserId)}`,
                    { headers },
                );
                const data = await res.json();
                if (res.ok) setUserReviews(data);
                else setUserReviews([]);
            } catch {
                setUserReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        }
    };

    const isLoading = otherUserLoading || friendStatusLoading;

    const reviewCount =
        friendStatus === "friends"
            ? otherUser?.total_review_count
            : otherUser?.public_review_count;

    return {
        otherUser,
        isLoading,
        friendStatus,
        sendingRequest,
        handleSendFriendRequest,
        reviewsOpen,
        userReviews,
        reviewsLoading,
        handleToggleReviews,
        reviewCount,
    };
}
