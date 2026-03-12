function Avatar({ name, picture, size = "md" }) {
    const sizes = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.split(" ").filter((part) => part.length > 0);
        console.log(
            "name:",
            name,
            "parts:",
            parts,
            "parts.length:",
            parts.length,
        );
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return parts
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={`${sizes[size]} rounded-full bg-primary-400 text-white flex items-center justify-center font-semibold overflow-hidden flex-shrink-0`}
        >
            {picture ? (
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
