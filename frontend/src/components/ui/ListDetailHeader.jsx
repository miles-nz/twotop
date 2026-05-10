import { ArrowLeft, Trash2, LogOut, Share2, CheckSquare } from "lucide-react";
import { text } from "../../resources";

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
}) {
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
                        <Share2 size={20} />
                    </button>
                )}
                {isOwner && (
                    <button
                        onClick={onToggleChecklist}
                        className={`p-1.5 transition-colors cursor-pointer ${
                            isChecklist
                                ? "text-secondary-500 hover:text-secondary-600"
                                : "text-text-light hover:text-text-dark"
                        }`}
                        aria-label={text.checklistMode}
                        title={text.checklistMode}
                    >
                        <CheckSquare size={20} />
                    </button>
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
