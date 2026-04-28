import Avatar from "./Avatar";
import { text } from "../../resources";

export default function NotificationItem({ notification, onResolve }) {
    const { id, type, data, read, resolved } = notification;

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
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() =>
                                onResolve(data.request_id, "accept", id)
                            }
                            className="text-xs bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {text.accept}
                        </button>
                        <button
                            onClick={() =>
                                onResolve(data.request_id, "decline", id)
                            }
                            className="text-xs border border-surface-300 hover:bg-surface-200 text-text-mid px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {text.decline}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (type === "friend_accepted") {
        return (
            <div
                className={`px-4 py-3 border-b border-surface-200 last:border-b-0 ${read ? "opacity-60" : ""}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        name={data.friend_name}
                        picture={data.friend_picture}
                    />
                    <p className="text-sm text-text-dark">
                        <span className="font-medium">{data.friend_name}</span>
                        {text.acceptedYourFriendRequest}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
