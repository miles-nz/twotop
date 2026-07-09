import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { text } from "../../resources";
import Avatar from "../ui/Avatar";
import LinkedAvatar from "../ui/LinkedAvatar";
import { makeProfileUrl } from "../../utils";

function FriendsModal({
    sharedWith,
    onSharedWithChange,
    onClose,
    getAccessTokenSilently,
    currentUserEmail,
}) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [users, setUsers] = useState(sharedWith);
    const [confirmRemoveId, setConfirmRemoveId] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchPending = async () => {
            setPendingLoading(true);
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/friends/requests/pending`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const data = await res.json();
                if (res.ok) setPendingRequests(data);
            } catch (err) {
                console.error("Failed to fetch pending requests:", err);
            } finally {
                setPendingLoading(false);
            }
        };
        fetchPending();
    }, [getAccessTokenSilently]);

    const handleSendRequest = async () => {
        setError(null);
        setSuccess(null);

        if (!email || !email.includes("@")) {
            setError(text.invalidEmail);
            return;
        }

        if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
            setError(text.selfFriendRequest);
            return;
        }

        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/friends/request`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                },
            );
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || text.errorGeneric);
                return;
            }

            const pendingRes = await fetch(
                `${import.meta.env.VITE_API_URL}/friends/requests/pending`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const pendingData = await pendingRes.json();
            if (pendingRes.ok) setPendingRequests(pendingData);

            setSuccess(text.friendRequestSent);
            setEmail("");
        } catch (err) {
            console.error("FriendsModal error:", err);
            setError(text.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (requestId) => {
        setCancellingId(requestId);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/friends/request/${requestId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!res.ok) throw new Error(text.errorFailedCancelRequest);
            setPendingRequests((prev) =>
                prev.filter((r) => r.id !== requestId),
            );
        } catch (err) {
            console.error(text.errorFailedCancelRequest, err);
            setError(
                `${text.errorFailedCancelRequest} ${text.errorPleaseTryAgain}`,
            );
        } finally {
            setCancellingId(null);
        }
    };

    const handleConfirmRemove = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/friends/${confirmRemoveId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!res.ok) throw new Error(text.errorFailedRemoveFriend);

            const newUsers = users.filter((u) => u.user_id !== confirmRemoveId);
            setUsers(newUsers);
            onSharedWithChange(newUsers);
        } catch (err) {
            console.error(text.errorFailedRemoveFriend, err);
            setError(
                `${text.errorFailedRemoveFriend} ${text.errorPleaseTryAgain}`,
            );
        } finally {
            setConfirmRemoveId(null);
        }
    };

    const hasPending = pendingRequests.length > 0;
    const hasFriends = users.length > 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface-50 rounded-2xl shadow-xl border border-surface-200 w-full max-w-sm overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-text-dark">
                            {text.friendsLabel}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-dark transition-colors"
                            aria-label={text.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Send friend request */}
                    <div className="px-5 py-4 border-b border-surface-200">
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setSuccess(null);
                                    setError(null);
                                }}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSendRequest()
                                }
                                placeholder={text.addFriendInputPlaceholder}
                                className="flex-1 text-sm border border-surface-300 rounded-lg px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-text-dark placeholder-text-light"
                            />
                            <button
                                onClick={handleSendRequest}
                                disabled={loading}
                                className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {loading ? text.sending : text.add}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-error-500 mt-2">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="text-xs text-secondary-500 mt-2">
                                {success}
                            </p>
                        )}
                        <p className="text-xs text-text-light mt-2">
                            {text.friendRequestLabel}
                        </p>
                    </div>

                    {/* List area */}
                    <div className="px-5 py-2 max-h-72 overflow-y-auto">
                        {/* Pending requests section */}
                        {!pendingLoading && hasPending && (
                            <div className="mb-1">
                                <p className="text-xs font-medium text-text-light uppercase tracking-wide py-2">
                                    {text.pending}
                                </p>
                                <ul className="divide-y divide-surface-200">
                                    {pendingRequests.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <Link
                                                to={makeProfileUrl(
                                                    r.receiver_id,
                                                )}
                                                onClick={onClose}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="rounded-full ring-2 ring-surface-50 group-hover:ring-secondary-400 transition-all">
                                                    <Avatar
                                                        name={r.receiver_name}
                                                        picture={
                                                            r.receiver_picture
                                                        }
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-text-dark transition-colors duration-100">
                                                        {r.receiver_name}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-text-light group-hover:text-text-mid transition-colors duration-100">
                                                        <Clock size={10} />
                                                        {text.pending}
                                                    </span>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleCancelRequest(r.id)
                                                }
                                                disabled={cancellingId === r.id}
                                                className="text-xs text-text-light hover:text-error-500 disabled:opacity-40 transition-colors"
                                            >
                                                {cancellingId === r.id
                                                    ? text.cancelling
                                                    : text.cancel}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Divider between pending and friends */}
                        {hasPending && hasFriends && (
                            <div className="border-t border-surface-200 my-1" />
                        )}

                        {/* Friends section */}
                        {!hasFriends && !hasPending && !pendingLoading && (
                            <p className="text-sm text-text-light py-4 text-center">
                                {text.noSharedReviews}
                            </p>
                        )}

                        {hasFriends && (
                            <>
                                {hasPending && (
                                    <p className="text-xs font-medium text-text-light uppercase tracking-wide py-2">
                                        {text.friendsLabel}
                                    </p>
                                )}
                                <ul className="divide-y divide-surface-200">
                                    {users.map((u) => (
                                        <li
                                            key={u.user_id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div onClick={onClose}>
                                                <LinkedAvatar
                                                    name={u.name}
                                                    picture={u.picture}
                                                    userId={u.user_id}
                                                    showName={true}
                                                    nameSide="right"
                                                />
                                            </div>
                                            {confirmRemoveId === u.user_id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-text-light">
                                                        {text.remove}?
                                                    </span>
                                                    <button
                                                        onClick={
                                                            handleConfirmRemove
                                                        }
                                                        className="text-xs text-error-500 hover:underline"
                                                    >
                                                        {text.yes}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setConfirmRemoveId(
                                                                null,
                                                            )
                                                        }
                                                        className="text-xs text-text-light hover:underline"
                                                    >
                                                        {text.cancel}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setConfirmRemoveId(
                                                            u.user_id,
                                                        )
                                                    }
                                                    className="p-1.5 rounded-full text-text-light hover:text-error-500 hover:bg-error-100 transition-colors"
                                                    aria-label={text.removeLabel(
                                                        u.name,
                                                    )}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-surface-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="text-sm text-text-mid hover:text-text-dark transition-colors"
                        >
                            {text.done}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default FriendsModal;
