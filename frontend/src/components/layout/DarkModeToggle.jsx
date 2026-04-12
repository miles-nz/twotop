import { Sun, Moon } from "lucide-react";
import { text } from "../../resources";
import Toggle from "../ui/Toggle";

export default function DarkModeToggle({ isDarkMode, onToggle }) {
    return (
        <Toggle
            value={isDarkMode}
            onToggle={onToggle}
            ariaLabel={text.toggleDarkMode}
        >
            {isDarkMode ? (
                <Moon size={10} className="text-secondary-500" />
            ) : (
                <Sun size={10} className="text-secondary-500" />
            )}
        </Toggle>
    );
}
