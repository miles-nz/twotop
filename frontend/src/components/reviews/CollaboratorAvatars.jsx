import { useState } from "react";
import Avatar from "../ui/Avatar";
import { Link } from "react-router-dom";
import { makeProfileUrl } from "../../utils";

export default function CollaboratorAvatars({ owner, contributors }) {
    const allPeople = [owner, ...contributors];
    const totalCount = allPeople.length;
    const visibleAvatars = allPeople.slice(0, 3);
    const overlap = totalCount === 2 ? "-space-x-1" : "-space-x-3";
    const tooltipNames = allPeople.map((p) => p.name).join(", ");

    const [ownerHovered, setOwnerHovered] = useState(false);
    const [contributorHovered, setContributorHovered] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
        <div className="flex items-center gap-2" title={tooltipNames}>
            <span className="text-xs text-text-mid">
                <Link
                    to={makeProfileUrl(owner.user_id)}
                    onMouseEnter={() => setHoveredIndex(0)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`transition-colors duration-100 ${hoveredIndex === 0 ? "text-text-dark" : ""}`}
                >
                    {owner.name}
                </Link>
                {contributors.length > 0 && ` +${contributors.length}`}
            </span>
            <div className={`flex items-center ${overlap}`}>
                {visibleAvatars.map((person, i) => (
                    <Link
                        key={person.user_id ?? person.name}
                        to={makeProfileUrl(person.user_id)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`rounded-full ring-2 transition-all ${hoveredIndex === i ? "ring-secondary-400" : "ring-surface-50"}`}
                        style={{ zIndex: visibleAvatars.length - i }}
                    >
                        <Avatar
                            name={person.name}
                            picture={person.picture}
                            size="sm"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}
