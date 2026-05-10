import { useState, useRef, useCallback } from "react";

export default function useSortableList(initialItems) {
    const [items, setItems] = useState(initialItems);
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const [dragY, setDragY] = useState(0);

    const itemRefs = useRef([]);
    const dragStartY = useRef(null);
    const isDragging = useRef(false);
    const dragIndexRef = useRef(null);
    const overIndexRef = useRef(null);

    const getOverIndex = useCallback((clientY) => {
        const di = dragIndexRef.current;
        if (di === null) return null;

        const draggedRef = itemRefs.current[di];
        if (!draggedRef) return di;

        const draggedRect = draggedRef.getBoundingClientRect();
        const itemH = draggedRect.height + 8;

        const deltaY = clientY - dragStartY.current;
        const slotsMoved = Math.round(deltaY / itemH);
        const newIndex = Math.max(
            0,
            Math.min(itemRefs.current.length - 1, di + slotsMoved),
        );

        return newIndex;
    }, []);

    const handleDragStart = useCallback((index, clientY) => {
        isDragging.current = true;
        dragStartY.current = clientY;
        dragIndexRef.current = index;
        overIndexRef.current = index;
        setDragIndex(index);
        setOverIndex(index);
        setDragY(0);
    }, []);

    const handleDragMove = useCallback(
        (clientY) => {
            if (!isDragging.current) return;
            setDragY(clientY - dragStartY.current);
            const over = getOverIndex(clientY);
            if (over !== null) {
                overIndexRef.current = over;
                setOverIndex(over);
            }
        },
        [getOverIndex],
    );

    const handleDragEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const di = dragIndexRef.current;
        const oi = overIndexRef.current;

        setItems((prev) => {
            if (di === null || oi === null || di === oi) return prev;
            const next = [...prev];
            const [moved] = next.splice(di, 1);
            next.splice(oi, 0, moved);
            return next;
        });

        dragIndexRef.current = null;
        overIndexRef.current = null;
        setDragIndex(null);
        setOverIndex(null);
        setDragY(0);
        dragStartY.current = null;
    }, []);

    const getMouseHandlers = useCallback(
        (index) => ({
            onMouseDown: (e) => {
                e.preventDefault();
                handleDragStart(index, e.clientY);

                const onMouseMove = (e) => handleDragMove(e.clientY);
                const onMouseUp = () => {
                    handleDragEnd();
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
            },
        }),
        [handleDragStart, handleDragMove, handleDragEnd],
    );

    const getTouchHandlers = useCallback(
        (index) => ({
            onTouchStart: (e) => {
                handleDragStart(index, e.touches[0].clientY);
            },
            onTouchMove: (e) => {
                e.preventDefault();
                handleDragMove(e.touches[0].clientY);
            },
            onTouchEnd: () => {
                handleDragEnd();
            },
        }),
        [handleDragStart, handleDragMove, handleDragEnd],
    );

    const setItemRef = useCallback((index, el) => {
        itemRefs.current[index] = el;
    }, []);

    return {
        items,
        setItems,
        dragIndex,
        overIndex,
        dragY,
        getMouseHandlers,
        getTouchHandlers,
        setItemRef,
    };
}
