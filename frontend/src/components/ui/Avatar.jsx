import LoadingDots from "./LoadingDots";
import { isDefaultAvatar } from "../../utils";

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ").filter((part) => part.length > 0);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

function Avatar({ name, picture, size = "md", title, loading = false }) {
    const sizes = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
    };

    return (
        <div
            className={`${sizes[size]} rounded-full bg-primary-400 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0`}
            title={title || name}
        >
            {loading ? (
                <LoadingDots size="w-1 h-1" color="bg-white" />
            ) : picture && !isDefaultAvatar(picture) ? (
                <img
                    src={picture}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                getInitials(name)
            )}
        </div>
    );
}

export default Avatar;
