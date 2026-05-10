import {
    ArrowLeft,
    Trash2,
    LogOut,
    Share,
    Share2,
    MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { text } from "../../resources";
import Toggle from "./Toggle";
import { getOS } from "../../utils";

const ShareIcon = ["ios", "macos"].includes(getOS()) ? Share : Share2;

export default function ListDetailHeader({
    isOwner,
    canEdit,
    isChecklist,
    confirmDelete,
    confirmLeave,
    onBack,
    onShare,
    onToggleChecklist,
    onDeleteConfirm,
    onDeleteCancel,
    onDelete,
    onLeaveConfirm,
    onLeaveCancel,
    onLeave,
    onSortChecked,
    hasCheckedItems,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex items-center justify-between gap-3">
            <button
                onClick={onBack}
                className="p-1.5 text-text-light hover:text-text-dark transition-colors cursor-pointer"
                aria-label={text.back}
            >
                <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
                {canEdit && (
                    <button
                        onClick={onShare}
                        className="p-1.5 text-text-light hover:text-text-dark transition-colors cursor-pointer"
                        aria-label={text.shareList}
                        title={text.shareList}
                    >
                        <ShareIcon size={20} />
                    </button>
                )}
                {(isOwner || canEdit) && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="p-1.5 text-text-light hover:text-text-dark transition-colors cursor-pointer"
                            aria-label="More options"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-1 w-52 bg-surface-50 border border-surface-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                    <div className="w-full px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-text-dark">
                                            {text.checklistMode}
                                        </span>
                                        <Toggle
                                            value={isChecklist}
                                            onToggle={(val) => {
                                                onToggleChecklist(val);
                                            }}
                                            ariaLabel={text.checklistMode}
                                        />
                                    </div>
                                    {isChecklist && hasCheckedItems && (
                                        <button
                                            onClick={() => {
                                                onSortChecked();
                                                setMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-text-dark hover:bg-surface-100 transition-colors cursor-pointer border-t border-surface-200"
                                        >
                                            {text.moveCheckedToBottom}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
                {isOwner && (
                    <>
                        {confirmDelete ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-light">
                                    {text.confirmDeleteList}
                                </span>
                                <button
                                    onClick={onDelete}
                                    className="text-xs text-error-500 hover:underline cursor-pointer"
                                >
                                    {text.yes}
                                </button>
                                <button
                                    onClick={onDeleteCancel}
                                    className="text-xs text-text-light hover:underline cursor-pointer"
                                >
                                    {text.cancel}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onDeleteConfirm}
                                className="p-1.5 text-text-light hover:text-error-500 transition-colors cursor-pointer"
                                aria-label={text.deleteList}
                                title={text.deleteList}
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </>
                )}
                {!isOwner && (
                    <>
                        {confirmLeave ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-light">
                                    {text.confirmLeaveList}
                                </span>
                                <button
                                    onClick={onLeave}
                                    className="text-xs text-error-500 hover:underline cursor-pointer"
                                >
                                    {text.yes}
                                </button>
                                <button
                                    onClick={onLeaveCancel}
                                    className="text-xs text-text-light hover:underline cursor-pointer"
                                >
                                    {text.cancel}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLeaveConfirm}
                                className="p-1.5 text-text-light hover:text-error-500 transition-colors cursor-pointer"
                                aria-label={text.leaveList}
                                title={text.leaveList}
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
