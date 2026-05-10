import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { text } from "../../resources";
import { Eye, PenLine } from "lucide-react";
import { formatNotificationTime } from "../../utils";

export default function NotificationItem({
    notification,
    onResolve,
    onMarkAsRead,
}) {
    const { id, type, data, read, resolved } = notification;
    const navigate = useNavigate();

    if (type === "friend_request") {
        return (
            <div className="px-4 py-3 border-b border-surface-200 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.sender_name}
                        picture={data.sender_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">{data.sender_name}</span>
                        {text.sentYouAFriendRequest}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                    {resolved === "accept" && (
                        <p className="text-xs text-secondary-500 font-medium">
                            {text.requestAccepted}
                        </p>
                    )}
                    {resolved === "decline" && (
                        <p className="text-xs text-text-light">
                            {text.requestDeclined}
                        </p>
                    )}
                    {!resolved && (
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    onResolve(data.request_id, "accept", id)
                                }
                                className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                {text.accept}
                            </button>
                            <button
                                onClick={() =>
                                    onResolve(data.request_id, "decline", id)
                                }
                                className="text-xs border border-surface-300 hover:bg-surface-200 text-text-mid px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                {text.decline}
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-text-light ml-auto">
                        {formatNotificationTime(notification.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    if (type === "friend_accepted") {
        return (
            <div
                className={`px-4 py-3 border-b border-surface-200 last:border-b-0 ${read ? "opacity-60" : ""}`}
            >
                <div className="flex items-center gap-3">
                    <Avatar
                        name={data.friend_name}
                        picture={data.friend_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">{data.friend_name}</span>
                        {text.acceptedYourFriendRequest}
                    </p>
                </div>
                <div className="flex justify-end mt-1">
                    <p className="text-xs text-text-light">
                        {formatNotificationTime(notification.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    if (type === "list_shared") {
        return (
            <div className="px-4 py-3 border-b border-surface-200 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.sharer_name}
                        picture={data.sharer_picture}
                    />
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-text-dark">
                            <span className="font-medium">
                                {data.sharer_name}
                            </span>
                            {text.sharedAListWithYou}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-text-dark">
                                {data.list_name}
                            </span>
                            {data.permission === "edit" ? (
                                <PenLine
                                    size={11}
                                    className="text-secondary-500"
                                />
                            ) : (
                                <Eye size={11} className="text-text-light" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                    {resolved === "accept" && (
                        <p className="text-xs text-secondary-500 font-medium">
                            {text.requestAccepted}
                        </p>
                    )}
                    {resolved === "decline" && (
                        <p className="text-xs text-text-light">
                            {text.requestDeclined}
                        </p>
                    )}
                    {!resolved && (
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    onResolve(id, "accept", id, "list_shared")
                                }
                                className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                {text.accept}
                            </button>
                            <button
                                onClick={() =>
                                    onResolve(id, "decline", id, "list_shared")
                                }
                                className="text-xs border border-surface-300 hover:bg-surface-200 text-text-mid px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                {text.decline}
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-text-light ml-auto">
                        {formatNotificationTime(notification.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    if (type === "list_share_accepted") {
        return (
            <div
                className={`px-4 py-3 border-b border-surface-200 last:border-b-0 ${read ? "opacity-60" : ""}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.acceptor_name}
                        picture={data.acceptor_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">
                            {data.acceptor_name}
                        </span>
                        {text.acceptedYourListShare}{" "}
                        <span className="font-medium">{data.list_name}</span>
                    </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <button
                        onClick={() => {
                            onMarkAsRead?.(id);
                            navigate(`/lists/${data.list_id}`);
                        }}
                        className="text-xs text-secondary-500 hover:underline transition-colors cursor-pointer"
                    >
                        {text.viewList}
                    </button>
                    <p className="text-xs text-text-light">
                        {formatNotificationTime(notification.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    if (type === "list_updated") {
        return (
            <div
                className={`px-4 py-3 border-b border-surface-200 last:border-b-0 ${read ? "opacity-60" : ""}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.editor_name}
                        picture={data.editor_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">{data.editor_name}</span>
                        {data.is_leave
                            ? text.leftYourList
                            : text.updatedYourList}{" "}
                        <span className="font-medium">{data.list_name}</span>
                    </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <button
                        onClick={() => {
                            onMarkAsRead?.(id);
                            navigate(`/lists/${data.list_id}`);
                        }}
                        className="text-xs text-secondary-500 hover:underline transition-colors cursor-pointer"
                    >
                        {text.viewList}
                    </button>
                    <p className="text-xs text-text-light">
                        {formatNotificationTime(notification.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
