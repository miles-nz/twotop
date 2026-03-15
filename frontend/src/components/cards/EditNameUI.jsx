import { Check, X } from "lucide-react";

function EditNameUI({ editedName, setEditedName, handleSaveName, onClose }) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-text-dark bg-transparent border-b border-secondary-400 focus:outline-none w-full"
            />
            <button
                onClick={handleSaveName}
                className="text-secondary-500 hover:text-secondary-600 cursor-pointer"
            >
                <Check size={18} />
            </button>
            <button
                onClick={onClose}
                className="text-text-light hover:text-text-mid cursor-pointer"
            >
                <X size={18} />
            </button>
        </div>
    );
}

export default EditNameUI;
