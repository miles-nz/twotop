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
            <NotificationWrapper actionable>
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
                <NotificationFooter
                    timestamp={notification.created_at}
                    action={
                        <NotificationActions
                            resolved={resolved}
                            onAccept={() =>
                                onResolve(data.request_id, "accept", id)
                            }
                            onDecline={() =>
                                onResolve(data.request_id, "decline", id)
                            }
                        />
                    }
                />
            </NotificationWrapper>
        );
    }

    if (type === "friend_accepted") {
        return (
            <NotificationWrapper read={read}>
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
                <NotificationFooter timestamp={notification.created_at} />
            </NotificationWrapper>
        );
    }

    if (type === "list_shared") {
        return (
            <NotificationWrapper actionable>
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
                <NotificationFooter
                    timestamp={notification.created_at}
                    action={
                        <NotificationActions
                            resolved={resolved}
                            onAccept={() =>
                                onResolve(id, "accept", id, "list_shared")
                            }
                            onDecline={() =>
                                onResolve(id, "decline", id, "list_shared")
                            }
                        />
                    }
                />
            </NotificationWrapper>
        );
    }

    if (type === "list_share_accepted") {
        return (
            <NotificationWrapper read={read}>
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
                <NotificationFooter
                    timestamp={notification.created_at}
                    action={
                        <button
                            onClick={() => {
                                onMarkAsRead?.(id);
                                navigate(`/lists/${data.list_id}`);
                            }}
                            className="text-xs text-secondary-500 hover:underline transition-colors"
                        >
                            {text.viewList}
                        </button>
                    }
                />
            </NotificationWrapper>
        );
    }

    if (type === "list_updated") {
        return (
            <NotificationWrapper read={read}>
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
                <NotificationFooter
                    timestamp={notification.created_at}
                    action={
                        <button
                            onClick={() => {
                                onMarkAsRead?.(id);
                                navigate(`/lists/${data.list_id}`);
                            }}
                            className="text-xs text-secondary-500 hover:underline transition-colors"
                        >
                            {text.viewList}
                        </button>
                    }
                />
            </NotificationWrapper>
        );
    }

    if (type === "review_contributor_added") {
        return (
            <NotificationWrapper read={read}>
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.adder_name}
                        picture={data.adder_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">{data.adder_name}</span>
                        {text.addedYouAsContributor}
                        <span className="font-medium">
                            {data.restaurant_name}
                        </span>
                    </p>
                </div>
                <NotificationFooter
                    timestamp={notification.created_at}
                    action={
                        <button
                            onClick={() => {
                                onMarkAsRead?.(id);
                                navigate(`/reviews/${data.review_id}`);
                            }}
                            className={
                                read
                                    ? "text-xs text-secondary-500 hover:underline transition-colors"
                                    : "text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                            }
                        >
                            {text.viewReview}
                        </button>
                    }
                />
            </NotificationWrapper>
        );
    }

    return null;
}

function NotificationActions({ onAccept, onDecline, resolved }) {
    if (resolved === "accept") {
        return (
            <p className="text-xs text-secondary-500 font-medium">
                {text.requestAccepted}
            </p>
        );
    }
    if (resolved === "decline") {
        return (
            <p className="text-xs text-text-light">{text.requestDeclined}</p>
        );
    }
    return (
        <div className="flex gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAccept();
                }}
                className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
                {text.accept}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDecline();
                }}
                className="text-xs border border-surface-300 hover:bg-surface-200 text-text-mid px-3 py-1.5 rounded-lg transition-colors"
            >
                {text.decline}
            </button>
        </div>
    );
}

function NotificationFooter({ action, timestamp }) {
    return (
        <div className="flex items-center justify-between mt-1">
            {action ?? <span />}
            <p className="text-xs text-text-light ml-auto">
                {formatNotificationTime(timestamp)}
            </p>
        </div>
    );
}

function NotificationWrapper({ read, actionable = false, children }) {
    return (
        <div
            className={`px-4 py-3 border-b border-surface-200 last:border-b-0 ${!actionable && read ? "opacity-60" : ""}`}
        >
            {children}
        </div>
    );
}
