import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import { makeProfileUrl } from "../../utils";

export default function LinkedAvatar({
    name,
    picture,
    size = "md",
    userId,
    nameSide = "right",
    showName = true,
    className = "",
}) {
    return (
        <Link
            to={makeProfileUrl(userId)}
            className={`flex items-center gap-2 group ${className}`}
        >
            {showName && name && nameSide === "left" && (
                <span className="text-xs text-text-mid group-hover:text-text-dark transition-colors duration-100">
                    {name}
                </span>
            )}
            <div className="rounded-full ring-2 ring-surface-50 group-hover:ring-secondary-400 transition-all">
                <Avatar name={name} picture={picture} size={size} />
            </div>
            {showName && name && nameSide === "right" && (
                <span className="text-xs text-text-mid group-hover:text-text-dark transition-colors duration-100">
                    {name}
                </span>
            )}
        </Link>
    );
}
