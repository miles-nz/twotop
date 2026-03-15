import { createContext, useContext, useState } from "react";

const ReviewListContext = createContext(null);

export function ReviewListProvider({ children }) {
    const [expandedId, setExpandedId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const handleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleMenuOpen = (id) => setOpenMenuId(id);
    const handleMenuClose = () => setOpenMenuId(null);

    return (
        <ReviewListContext.Provider
            value={{
                expandedId,
                handleExpand,
                openMenuId,
                handleMenuOpen,
                handleMenuClose,
            }}
        >
            {children}
        </ReviewListContext.Provider>
    );
}

export function useReviewList() {
    return useContext(ReviewListContext);
}
