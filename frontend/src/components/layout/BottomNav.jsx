import { NavLink } from "react-router-dom";
import { NotebookText, List } from "lucide-react";
import { text } from "../../resources";

export default function BottomNav() {
    const baseClass =
        "flex flex-col items-center gap-1 px-6 py-4 transition-colors";
    const activeClass = "text-text-dark";
    const inactiveClass = "text-text-light";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-50 border-t border-surface-200 flex justify-around md:hidden">
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                }
            >
                <NotebookText size={22} />
                <span className="text-xs font-medium">{text.reviews}</span>
            </NavLink>
            <NavLink
                to="/lists"
                className={({ isActive }) =>
                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                }
            >
                <List size={22} />
                <span className="text-xs font-medium">{text.lists}</span>
            </NavLink>
        </nav>
    );
}
