import { useState, useEffect } from "react";
import LoadingDots from "./LoadingDots";
import { isDefaultAvatar } from "../../utils";
import { motion } from "framer-motion";

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
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        if (!picture) {
            setImageLoaded(false);
            return;
        }
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.src = picture;
    }, [picture]);

    const sizes = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
    };

    return (
        <div
            className={`${sizes[size]} rounded-full bg-secondary-400 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0`}
            title={title || name}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {picture && !isDefaultAvatar(picture) && (
                    <motion.img
                        src={picture}
                        alt={name}
                        className="w-full h-full object-cover absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoaded ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
                {!loading && (!picture || isDefaultAvatar(picture)) && (
                    <span className="absolute">{getInitials(name)}</span>
                )}
            </div>
        </div>
    );
}

export default Avatar;
