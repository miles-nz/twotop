import { text } from "../../resources";
import Toggle from "../ui/Toggle";

export default function PublicToggle({ isPublic, onToggle, className = "" }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <p className="text-xs text-text-light">{text.public}</p>
            <Toggle
                value={isPublic}
                onToggle={onToggle}
                ariaLabel={text.publicOnly}
            />
        </div>
    );
}
