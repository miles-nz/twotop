import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { text } from "../../resources";
import Avatar from "../ui/Avatar";
import { useUser } from "../../contexts/UserContext";

export default function ShareListModal({
    listId,
    listName,
    shares,
    shareToken: initialShareToken,
    isOwner,
    ownerId,
    ownerName,
    ownerPicture,
    onClose,
    getAccessTokenSilently,
}) {
    const { sharedWith } = useUser();
    const [currentShares, setCurrentShares] = useState(shares || []);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedPermission, setSelectedPermission] = useState("view");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmRemoveId, setConfirmRemoveId] = useState(null);
    const [shareToken, setShareToken] = useState(initialShareToken ?? null);
    const [generatingToken, setGeneratingToken] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const availableFriends = sharedWith.filter(
        (friend) =>
            !currentShares.some((s) => s.user_id === friend.user_id) &&
            friend.user_id !== ownerId,
    );

    const handleShare = async () => {
        if (!selectedUserId) return;
        setError(null);
        setLoading(true);

        const friend = sharedWith.find((f) => f.user_id === selectedUserId);
        if (!friend) return;

        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${listId}/share`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: selectedUserId,
                        permission: selectedPermission,
                    }),
                },
            );
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || text.errorGeneric);
                return;
            }

            setCurrentShares((prev) => [
                ...prev,
                {
                    user_id: selectedUserId,
                    name: friend.name,
                    picture: friend.picture,
                    permission: selectedPermission,
                    pending: true,
                },
            ]);
            setSelectedUserId(null);
            setSelectedPermission("view");
        } catch (err) {
            console.error("Failed to share list:", err);
            setError(text.errorGeneric);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${listId}/share/${confirmRemoveId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) {
                setCurrentShares((prev) =>
                    prev.filter((s) => s.user_id !== confirmRemoveId),
                );
            }
        } catch (err) {
            console.error("Failed to remove share:", err);
            setError(text.errorGeneric);
        } finally {
            setConfirmRemoveId(null);
        }
    };

    const handleGenerateLink = async () => {
        setGeneratingToken(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${listId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ generate_share_token: true }),
                },
            );
            const data = await res.json();
            if (res.ok) {
                setShareToken(data.share_token);
                await navigator.clipboard.writeText(
                    `${window.location.origin}/lists/shared/${data.share_token}`,
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setGeneratingToken(false);
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(
            `${window.location.origin}/lists/shared/${shareToken}`,
        );
    };

    const handleRevokeLink = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/lists/${listId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ revoke_share_token: true }),
                },
            );
            if (res.ok) {
                setShareToken(null);
                setConfirmRevoke(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-sm font-medium text-text-dark">
                                {text.shareList}
                            </h2>
                            <p className="text-xs text-text-light truncate max-w-56">
                                {listName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-dark transition-colors"
                            aria-label={text.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Share with friend */}
                    <div className="px-5 py-4 border-b border-surface-200 flex flex-col gap-3">
                        {availableFriends.length === 0 ? (
                            <p className="text-sm text-text-light">
                                {currentShares.length > 0
                                    ? text.allFriendsShared
                                    : text.noFriendsToShare}
                            </p>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                    {availableFriends.map((friend) => (
                                        <button
                                            key={friend.user_id}
                                            onClick={() =>
                                                setSelectedUserId(
                                                    selectedUserId ===
                                                        friend.user_id
                                                        ? null
                                                        : friend.user_id,
                                                )
                                            }
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                                                selectedUserId ===
                                                friend.user_id
                                                    ? "border-secondary-400 bg-secondary-50"
                                                    : "border-surface-200 hover:bg-surface-100"
                                            }`}
                                        >
                                            <Avatar
                                                name={friend.name}
                                                picture={friend.picture}
                                            />
                                            <span className="text-sm text-text-dark">
                                                {friend.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {selectedUserId && isOwner && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-text-light">
                                            {text.permissionLabel}
                                        </span>
                                        <div className="flex gap-2">
                                            {["view", "edit"].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() =>
                                                        setSelectedPermission(p)
                                                    }
                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                                        selectedPermission === p
                                                            ? "border-secondary-400 bg-secondary-50 text-secondary-600"
                                                            : "border-surface-200 text-text-light hover:bg-surface-100"
                                                    }`}
                                                >
                                                    {p === "view"
                                                        ? text.canView
                                                        : text.canEdit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedUserId && (
                                    <button
                                        onClick={handleShare}
                                        disabled={loading}
                                        className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors self-end"
                                    >
                                        {loading ? text.sending : text.send}
                                    </button>
                                )}
                            </>
                        )}
                        {error && (
                            <p className="text-xs text-error-500">{error}</p>
                        )}
                    </div>

                    {/* Current shares */}
                    <div className="px-5 py-2 max-h-64 overflow-y-auto">
                        <ul className="divide-y divide-surface-200">
                            {/* Owner entry */}
                            <li className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        name={ownerName}
                                        picture={ownerPicture}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-text-dark">
                                            {ownerName}
                                        </span>
                                        <span className="text-xs text-text-light">
                                            {text.owner}
                                        </span>
                                    </div>
                                </div>
                            </li>

                            {/* Shared users */}
                            {currentShares.map((share) => (
                                <li
                                    key={share.user_id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            name={share.name}
                                            picture={share.picture}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm text-text-dark">
                                                {share.name}
                                            </span>
                                            <span className="text-xs text-text-light">
                                                {share.pending
                                                    ? text.pending
                                                    : share.permission ===
                                                        "edit"
                                                      ? text.canEdit
                                                      : text.canView}
                                            </span>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <>
                                            {confirmRemoveId ===
                                            share.user_id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-text-light">
                                                        {text.remove}?
                                                    </span>
                                                    <button
                                                        onClick={handleRemove}
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
                                                            share.user_id,
                                                        )
                                                    }
                                                    className="p-1.5 rounded-full text-text-light hover:text-error-500 hover:bg-error-100 transition-colors"
                                                    aria-label={text.removeLabel(
                                                        share.name,
                                                    )}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}

                            {currentShares.length === 0 && (
                                <li className="py-4 text-center">
                                    <p className="text-sm text-text-light">
                                        {text.notSharedYet}
                                    </p>
                                </li>
                            )}
                        </ul>
                    </div>

                    {isOwner && (
                        <div className="px-5 py-4 border-t border-surface-200 flex flex-col gap-3">
                            <p className="text-xs font-medium text-text-light uppercase tracking-wide">
                                {text.shareViaLink}
                            </p>
                            {shareToken ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}/lists/shared/${shareToken}`}
                                            className="text-xs text-text-light bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 flex-1 truncate"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-2 rounded-lg transition-colors shrink-0"
                                        >
                                            {text.copy}
                                        </button>
                                        {navigator.share && (
                                            <button
                                                onClick={async () => {
                                                    const url = `${window.location.origin}/lists/shared/${shareToken}`;
                                                    try {
                                                        await navigator.share({
                                                            url,
                                                        });
                                                    } catch {}
                                                }}
                                                className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-2 rounded-lg transition-colors shrink-0"
                                            >
                                                {text.share}
                                            </button>
                                        )}
                                    </div>
                                    {confirmRevoke ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-light">
                                                {text.confirmRevokeLink}
                                            </span>
                                            <button
                                                onClick={handleRevokeLink}
                                                className="text-xs text-error-500 hover:underline"
                                            >
                                                {text.yes}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setConfirmRevoke(false)
                                                }
                                                className="text-xs text-text-light hover:underline"
                                            >
                                                {text.cancel}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setConfirmRevoke(true)
                                            }
                                            className="text-xs text-error-500 hover:underline self-start transition-colors"
                                        >
                                            {text.revokeLink}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={generatingToken}
                                    className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-colors self-start"
                                >
                                    {generatingToken
                                        ? text.generating
                                        : text.generateLink}
                                </button>
                            )}
                        </div>
                    )}

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
