import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Avatar from "../ui/Avatar";
import LinkedAvatar from "../ui/LinkedAvatar";
import { Link } from "react-router-dom";
import { makeProfileUrl } from "../../utils";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { text } from "../../resources";

export default function CollaboratorAvatars({ owner, contributors }) {
    const allPeople = [owner, ...contributors];
    const totalCount = allPeople.length;
    const visibleAvatars = allPeople.slice(0, 3);
    const overlap = totalCount === 2 ? "-space-x-1" : "-space-x-3";
    const tooltipNames = allPeople.map((p) => p.name).join(", ");

    const [ownerHovered, setOwnerHovered] = useState(false);
    const [contributorHovered, setContributorHovered] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [listOpen, setListOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const isDesktop = useBreakpoint("md");

    useEffect(() => {
        if (!listOpen) return;
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target)) {
                setListOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [listOpen]);

    useEffect(() => {
        if (!listOpen || !isDesktop) return;
        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
                setPopoverPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 192,
                });
            }
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition);
        return () => window.removeEventListener("scroll", updatePosition);
    }, [listOpen, isDesktop]);

    const handleOpenList = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!listOpen && isDesktop && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPopoverPosition({
                top: rect.bottom + 8,
                left: rect.right - 192,
            });
        }
        setListOpen((prev) => !prev);
    };

    const reviewerList = (
        <ul className="divide-y divide-surface-200">
            {allPeople.map((person) => (
                <li key={person.user_id ?? person.name}>
                    <div onClick={() => setListOpen(false)}>
                        <LinkedAvatar
                            name={person.name}
                            picture={person.picture}
                            userId={person.user_id}
                            showName={true}
                            nameSide="right"
                            className="px-4 py-3"
                        />
                    </div>
                </li>
            ))}
        </ul>
    );

    if (totalCount === 2) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-text-mid flex items-center gap-1">
                    <Link
                        to={makeProfileUrl(owner.user_id)}
                        onMouseEnter={() => setOwnerHovered(true)}
                        onMouseLeave={() => setOwnerHovered(false)}
                        className={`transition-colors duration-100 ${ownerHovered ? "text-text-dark" : ""}`}
                    >
                        {owner.name}
                    </Link>
                    &amp;
                    <Link
                        to={makeProfileUrl(contributors[0].user_id)}
                        onMouseEnter={() => setContributorHovered(true)}
                        onMouseLeave={() => setContributorHovered(false)}
                        className={`transition-colors duration-100 ${contributorHovered ? "text-text-dark" : ""}`}
                    >
                        {contributors[0].name}
                    </Link>
                </span>
                <div className="flex items-center -space-x-1">
                    <Link
                        to={makeProfileUrl(owner.user_id)}
                        onMouseEnter={() => setOwnerHovered(true)}
                        onMouseLeave={() => setOwnerHovered(false)}
                        className={`rounded-full ring-2 transition-all ${ownerHovered ? "ring-secondary-400" : "ring-surface-50"}`}
                        style={{ zIndex: 2 }}
                    >
                        <Avatar
                            name={owner.name}
                            picture={owner.picture}
                            size="sm"
                        />
                    </Link>
                    <Link
                        to={makeProfileUrl(contributors[0].user_id)}
                        onMouseEnter={() => setContributorHovered(true)}
                        onMouseLeave={() => setContributorHovered(false)}
                        className={`rounded-full ring-2 transition-all ${contributorHovered ? "ring-secondary-400" : "ring-surface-50"}`}
                        style={{ zIndex: 1 }}
                    >
                        <Avatar
                            name={contributors[0].name}
                            picture={contributors[0].picture}
                            size="sm"
                        />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                ref={triggerRef}
                onClick={handleOpenList}
                className="flex items-center gap-2"
                title={tooltipNames}
            >
                <span className="text-xs text-text-mid">
                    <span
                        className={`transition-colors duration-100 ${hoveredIndex === 0 ? "text-text-dark" : ""}`}
                    >
                        {owner.name}
                    </span>
                    {contributors.length > 0 && ` +${contributors.length}`}
                </span>
                <div className={`flex items-center ${overlap}`}>
                    {visibleAvatars.map((person, i) => (
                        <div
                            key={person.user_id ?? person.name}
                            className={`rounded-full ring-2 transition-all ${listOpen ? "ring-secondary-400" : "ring-surface-50"}`}
                            style={{ zIndex: visibleAvatars.length - i }}
                        >
                            <Avatar
                                name={person.name}
                                picture={person.picture}
                                size="sm"
                            />
                        </div>
                    ))}
                </div>
            </button>

            {listOpen &&
                createPortal(
                    <>
                        {/* Mobile bottom sheet */}
                        {!isDesktop && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/40 z-50"
                                    onClick={() => setListOpen(false)}
                                />
                                <div className="fixed bottom-0 left-0 right-0 bg-surface-50 rounded-t-2xl border-t border-surface-200 shadow-xl z-50">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                                        <h2 className="text-sm font-medium text-text-dark">
                                            {text.reviewers}
                                        </h2>
                                        <button
                                            onClick={() => setListOpen(false)}
                                            className="text-text-light hover:text-text-dark transition-colors text-sm"
                                        >
                                            {text.done}
                                        </button>
                                    </div>
                                    {reviewerList}
                                </div>
                            </>
                        )}

                        {/* Desktop popover */}
                        {isDesktop && (
                            <div
                                className="fixed bg-surface-50 border border-surface-200 rounded-lg shadow-lg z-50 w-48"
                                style={{
                                    top: popoverPosition.top,
                                    left: popoverPosition.left,
                                }}
                            >
                                {reviewerList}
                            </div>
                        )}
                    </>,
                    document.body,
                )}
        </>
    );
}
