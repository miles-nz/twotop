import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../contexts/UserContext";
import { text } from "../resources";

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
    const [listsOpen, setListsOpen] = useState(false);
    const [userLists, setUserLists] = useState(null);
    const [listsLoading, setListsLoading] = useState(false);
    const [userError, setUserError] = useState(null);
    const [reviewsError, setReviewsError] = useState(null);
    const [listsError, setListsError] = useState(null);

    useEffect(() => {
        if (isOwnProfile || !userId) return;
        setOtherUser(null);
        setOtherUserLoading(true);
        setFriendStatus("loading");
        setFriendStatusLoading(true);
        setReviewsOpen(false);
        setUserReviews(null);
        setListsOpen(false);
        setUserLists(null);
    }, [userId]);

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
                if (!res.ok) {
                    setUserError(
                        `${text.errorGeneric} (${res.status}${data?.error ? `: ${data.error}` : ""})`,
                    );
                } else {
                    setOtherUser(data);
                }
            } catch (err) {
                setUserError(`${text.errorGeneric} (${err.message})`);
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
        const opening = !reviewsOpen;
        setReviewsOpen(opening);
        if (opening) {
            setListsOpen(false);
            if (userReviews === null) {
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
                    if (!res.ok) {
                        setReviewsError(
                            `${text.errorGeneric} (${res.status}${data?.error ? `: ${data.error}` : ""})`,
                        );
                        setUserReviews([]);
                    } else {
                        setUserReviews(data);
                    }
                } catch (err) {
                    setReviewsError(`${text.errorGeneric} (${err.message})`);
                    setUserReviews([]);
                } finally {
                    setReviewsLoading(false);
                }
            }
        }
    };

    const handleToggleLists = async () => {
        const opening = !listsOpen;
        setListsOpen(opening);
        if (opening) {
            setReviewsOpen(false);
            if (userLists === null) {
                setListsLoading(true);
                try {
                    const fullUserId = `auth0|${userId}`;
                    const res = await fetch(
                        `${import.meta.env.VITE_API_URL}/lists/user/${encodeURIComponent(fullUserId)}`,
                    );
                    const data = await res.json();
                    if (!res.ok) {
                        setListsError(
                            `${text.errorGeneric} (${res.status}${data?.error ? `: ${data.error}` : ""})`,
                        );
                        setUserLists([]);
                    } else {
                        setUserLists(data);
                    }
                } catch (err) {
                    setListsError(`${text.errorGeneric} (${err.message})`);
                    setUserLists([]);
                } finally {
                    setListsLoading(false);
                }
            }
        }
    };

    const isLoading = otherUserLoading || friendStatusLoading;
    const reviewCount =
        friendStatus === "friends"
            ? otherUser?.total_review_count
            : otherUser?.public_review_count;
    const listCount = otherUser?.featured_list_count ?? 0;

    return {
        otherUser,
        isLoading,
        friendStatus,
        sendingRequest,
        handleSendFriendRequest,
        reviewsOpen,
        setReviewsOpen,
        userReviews,
        reviewsLoading,
        handleToggleReviews,
        reviewCount,
        listsOpen,
        setListsOpen,
        userLists,
        listsLoading,
        handleToggleLists,
        listCount,
        userError,
        reviewsError,
        listsError,
    };
}
