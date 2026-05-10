import Avatar from "../ui/Avatar";
import { text } from "../../resources";

export default function CollaboratorAvatars({ owner, contributors }) {
    const allPeople = [owner, ...contributors];
    const totalCount = allPeople.length;
    const visibleAvatars = allPeople.slice(0, 3);
    const overlap = totalCount === 2 ? "-space-x-1" : "-space-x-3";

    const nameDisplay = text.makeContributorList(
        owner.name,
        contributors.map((c) => c.name),
    );

    const tooltipNames = allPeople.map((p) => p.name).join(", ");

    return (
        <div
            className="flex items-center gap-2"
            title={totalCount > 2 ? tooltipNames : undefined}
        >
            {/* Name */}
            <span className="text-xs text-text-mid">{nameDisplay}</span>

            {/* Stacked avatars -- owner on left with highest z-index */}
            <div className={`flex items-center ${overlap}`}>
                {visibleAvatars.map((person, i) => (
                    <div
                        key={person.user_id ?? person.name}
                        className="rounded-full ring-2 ring-surface-50"
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
        </div>
    );
}
