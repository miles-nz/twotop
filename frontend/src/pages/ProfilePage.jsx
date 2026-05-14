import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
    Camera,
    ChevronDown,
    ChevronUp,
    Share,
    Share2,
    LogOut,
    Moon,
    NotebookText,
    Users,
    Palette,
    BookOpen,
    LayoutList,
    X,
} from "lucide-react";
import Avatar from "../components/ui/Avatar";
import FriendsModal from "../components/layout/FriendsModal";
import ThemeModal from "../components/themes/ThemeModal";
import DarkModeToggle from "../components/layout/DarkModeToggle";
import LoadingDots from "../components/ui/LoadingDots";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ImageCropModal from "../components/reviews/ImageCropModal";
import InlineEdit from "../components/ui/InlineEdit";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import { text, enums } from "../resources";
import { getOS, isDefaultAvatar, makeProfileUrl } from "../utils";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useOtherUserProfile } from "../hooks/useOtherUserProfile";
import ConfirmModal from "../components/ui/ConfirmModal";
import ReviewCard from "../components/reviews/ReviewCard";
import { ReviewListProvider } from "../contexts/ReviewListContext";

const ShareIcon = ["ios", "macos"].includes(getOS()) ? Share : Share2;

export default function ProfilePage() {
    const { userId } = useParams();
    const { user, logout, getAccessTokenSilently } = useAuth0();
    const isOwnProfile = !userId || `auth0|${userId}` === user?.sub;
    const fileInputRef = useRef(null);
    const [cropSrc, setCropSrc] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const isDesktop = useBreakpoint("md");

    const {
        currentUserName,
        updateCurrentUserName,
        currentUserPicture,
        setCurrentUserPicture,
        sharedWith,
        handleSharedWithChange,
        setReviewerPictureUpdate,
        setReviewerNameUpdate,
        setShowTutorial,
    } = useUser();

    const {
        currentThemeId,
        handleThemeChange,
        handleThemePreview,
        colorMode,
        setColorMode,
    } = useTheme();

    const {
        otherUser,
        isLoading,
        friendStatus,
        sendingRequest,
        handleSendFriendRequest,
        reviewsOpen,
        setReviewsOpen,
        userReviews,
        reviewsLoading,
        handleToggleReviews,
        reviewCount,
        listsOpen,
        setListsOpen,
        userLists,
        listsLoading,
        handleToggleLists,
        listCount,
    } = useOtherUserProfile(userId, isOwnProfile);

    const [friendsModalOpen, setFriendsModalOpen] = useState(false);
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const picture = isDefaultAvatar(currentUserPicture)
        ? null
        : currentUserPicture;
    const displayName = currentUserName ?? user?.name;

    const handleUploadPicture = async (file) => {
        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("picture", file);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/picture`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setCurrentUserPicture(data.picture);
            setReviewerPictureUpdate({
                picture: data.picture,
                userId: user.sub,
            });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePicture = async () => {
        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/picture`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw new Error("Failed to delete picture");
            setCurrentUserPicture(null);
            setReviewerPictureUpdate({ picture: null, userId: user.sub });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveName = async (newName) => {
        setSavingName(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/name`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newName }),
                },
            );
            if (!response.ok) throw new Error("Failed to update name");
            updateCurrentUserName(newName);
            setReviewerNameUpdate({ name: newName, userId: user.sub });
            await getAccessTokenSilently({ ignoreCache: true });
        } catch (err) {
            console.error(err);
        } finally {
            setSavingName(false);
        }
    };

    const handleShare = async () => {
        const shortId = user.sub.replace("auth0|", "");
        const url = `${window.location.origin}/profile/${shortId}`;
        if (navigator.share) {
            try {
                await navigator.share({ url });
            } catch {}
        } else {
            await navigator.clipboard.writeText(url);
        }
    };

    if (!isOwnProfile && isLoading) {
        return (
            <div className="max-w-3xl mx-auto pt-4 pb-24 px-4 flex justify-center py-12">
                <LoadingDots />
            </div>
        );
    }

    if (!isOwnProfile) {
        return (
            <div className="max-w-3xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-0 flex flex-col gap-4">
                <div className="bg-surface-50 rounded-2xl border border-surface-200 shadow-sm p-6 flex flex-col items-center gap-3">
                    <Avatar
                        name={otherUser?.name}
                        picture={otherUser?.picture}
                        size="xl"
                    />
                    <p className="text-lg font-semibold text-text-dark">
                        {otherUser?.name}
                    </p>
                    {otherUser?.created_at && (
                        <p className="text-xs text-text-light">
                            {text.memberSince}{" "}
                            {new Date(otherUser.created_at).toLocaleDateString(
                                "en-NZ",
                                { month: "long", year: "numeric" },
                            )}
                        </p>
                    )}
                    {friendStatus === "friends" && (
                        <p className="text-sm text-text-light">
                            {text.friendsLabel}
                        </p>
                    )}
                    {friendStatus === "pending_sent" && (
                        <p className="text-sm text-text-light">
                            {text.pending}
                        </p>
                    )}
                    {friendStatus === null && (
                        <button
                            onClick={handleSendFriendRequest}
                            disabled={sendingRequest}
                            className="text-sm bg-secondary-500 hover:bg-secondary-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {sendingRequest ? text.sending : text.addFriend}
                        </button>
                    )}

                    {/* Reviews + Lists toggles */}
                    {(reviewCount > 0 || listCount > 0) && (
                        <div className="w-full border-t border-surface-200 pt-4 flex justify-center gap-6">
                            {reviewCount > 0 && (
                                <button
                                    onClick={() => {
                                        if (!reviewsOpen) setListsOpen(false);
                                        handleToggleReviews();
                                    }}
                                    className="flex items-center gap-1.5 text-sm text-text-light hover:text-text-dark transition-colors"
                                >
                                    <NotebookText size={14} />
                                    {text.reviewCountLabel(reviewCount)}
                                    {reviewsOpen ? (
                                        <ChevronUp size={14} />
                                    ) : (
                                        <ChevronDown size={14} />
                                    )}
                                </button>
                            )}
                            {listCount > 0 && (
                                <button
                                    onClick={() => {
                                        if (!listsOpen) setReviewsOpen(false);
                                        handleToggleLists();
                                    }}
                                    className="flex items-center gap-1.5 text-sm text-text-light hover:text-text-dark transition-colors"
                                >
                                    <LayoutList size={14} />
                                    {text.listCountLabel(listCount)}
                                    {listsOpen ? (
                                        <ChevronUp size={14} />
                                    ) : (
                                        <ChevronDown size={14} />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {reviewsOpen && (
                    <div className="flex flex-col gap-4">
                        {reviewsLoading && (
                            <div className="flex justify-center py-6">
                                <LoadingDots />
                            </div>
                        )}
                        {!reviewsLoading && userReviews?.length === 0 && (
                            <p className="text-sm text-text-light text-center py-6">
                                {text.noReviews}
                            </p>
                        )}
                        {!reviewsLoading && userReviews?.length > 0 && (
                            <ReviewListProvider>
                                {userReviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        currentUserId={user?.sub}
                                        onReviewUpdated={() => {}}
                                    />
                                ))}
                            </ReviewListProvider>
                        )}
                    </div>
                )}

                {listsOpen && (
                    <div className="flex flex-col gap-3">
                        {listsLoading && (
                            <div className="flex justify-center py-6">
                                <LoadingDots />
                            </div>
                        )}
                        {!listsLoading && userLists?.length === 0 && (
                            <p className="text-sm text-text-light text-center py-6">
                                {text.noLists}
                            </p>
                        )}
                        {!listsLoading &&
                            userLists?.length > 0 &&
                            userLists.map((list) => (
                                <a
                                    key={list.id}
                                    href={
                                        list.share_token
                                            ? `/lists/shared/${list.share_token}`
                                            : null
                                    }
                                    onClick={
                                        !list.share_token
                                            ? (e) => e.preventDefault()
                                            : undefined
                                    }
                                    className="block bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 hover:bg-surface-100 transition-colors"
                                >
                                    <p className="text-sm font-semibold text-text-dark">
                                        {list.name}
                                    </p>
                                    {list.description && (
                                        <p className="text-xs text-text-light mt-0.5">
                                            {list.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-text-light mt-1">
                                        {list.restaurants.length}{" "}
                                        {list.restaurants.length === 1
                                            ? text.restaurant
                                            : text.restaurants}
                                    </p>
                                </a>
                            ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-0 flex flex-col gap-4">
            {/* Profile header */}
            <div className="bg-surface-50 rounded-2xl border border-surface-200 shadow-sm p-6 flex flex-col items-center gap-3">
                <div className="relative">
                    <Avatar
                        name={displayName}
                        picture={picture}
                        size="xl"
                        loading={uploading || currentUserPicture === undefined}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-2 left-2 p-2.5 bg-surface-50 border border-surface-200 rounded-full text-text-light hover:text-text-dark transition-colors shadow-sm"
                        aria-label={text.uploadPhoto}
                    >
                        <Camera size={16} />
                    </button>
                    {picture && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="absolute top-2 right-2 p-2.5 bg-surface-50 border border-surface-200 rounded-full text-text-light hover:text-error-500 transition-colors shadow-sm"
                            aria-label={text.removePhoto}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {confirmDelete && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-text-light">
                            {text.removePhoto}?
                        </span>
                        <button
                            onClick={() => {
                                handleDeletePicture();
                                setConfirmDelete(false);
                            }}
                            className="text-sm text-error-500 hover:underline"
                        >
                            {text.yes}
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-sm text-text-light hover:underline"
                        >
                            {text.cancel}
                        </button>
                    </div>
                )}

                <InlineEdit
                    value={displayName || ""}
                    onSave={handleSaveName}
                    className="text-text-dark truncate text-center"
                    inputClassName="text-sm text-text-dark text-center"
                    displayMode={enums.inlineEditDisplayMode.valueWithPencil}
                    valueName="name"
                    hoverEffects={true}
                    showConfirmButton={true}
                />

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-sm text-text-light hover:text-text-dark transition-colors"
                >
                    <ShareIcon size={15} />
                    {text.shareProfile}
                </button>
            </div>

            {/* 2-col grid: Friends + Theme */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setFriendsModalOpen(true)}
                    className="bg-surface-50 border border-surface-200 rounded-2xl p-4 flex flex-col items-start gap-2 text-left hover:bg-surface-200 transition-colors"
                >
                    <Users size={20} className="text-text-light" />
                    <span className="text-sm font-medium text-text-dark">
                        {text.friendsLabel}
                    </span>
                </button>
                <button
                    onClick={() => setThemeModalOpen(true)}
                    className="bg-surface-50 border border-surface-200 rounded-2xl p-4 flex flex-col items-start gap-2 text-left hover:bg-surface-200 transition-colors"
                >
                    <Palette size={20} className="text-text-light" />
                    <span className="text-sm font-medium text-text-dark">
                        {text.theme}
                    </span>
                </button>
            </div>

            {/* Appearance row */}
            <div className="bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Moon size={18} className="text-text-light" />
                    <span className="text-sm font-medium text-text-dark">
                        {text.appearance}
                    </span>
                </div>
                <DarkModeToggle
                    colorMode={colorMode}
                    onColorModeChange={setColorMode}
                    iconOnly={!isDesktop}
                />
            </div>

            {/* 2-col grid: Tutorial + Log out */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setShowTutorial(true)}
                    className="bg-surface-50 border border-surface-200 rounded-2xl p-4 flex flex-col items-start gap-2 text-left hover:bg-surface-200 transition-colors"
                >
                    <BookOpen size={20} className="text-text-light" />
                    <span className="text-sm font-medium text-text-dark">
                        {text.showTutorial}
                    </span>
                </button>
                <button
                    onClick={() => setLogoutModalOpen(true)}
                    className="bg-surface-50 border border-surface-200 rounded-2xl p-4 flex flex-col items-start gap-2 text-left hover:bg-surface-200 transition-colors"
                >
                    <LogOut size={20} className="text-error-600" />
                    <span className="text-sm font-medium text-error-600">
                        {text.logOut}
                    </span>
                </button>
            </div>

            {friendsModalOpen && (
                <FriendsModal
                    sharedWith={sharedWith}
                    onSharedWithChange={handleSharedWithChange}
                    onClose={() => setFriendsModalOpen(false)}
                    getAccessTokenSilently={getAccessTokenSilently}
                    currentUserEmail={user?.email}
                />
            )}

            {themeModalOpen && (
                <ThemeModal
                    currentThemeId={currentThemeId}
                    onThemeChange={(themeId) => {
                        handleThemeChange(themeId);
                        setThemeModalOpen(false);
                    }}
                    onThemePreview={handleThemePreview}
                    onClose={() => setThemeModalOpen(false)}
                />
            )}
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setCropSrc(URL.createObjectURL(file));
                    e.target.value = "";
                }}
                className="hidden"
                ref={fileInputRef}
            />
            {cropSrc && (
                <ImageCropModal
                    imageSrc={cropSrc}
                    onConfirm={(croppedFile) => {
                        handleUploadPicture(croppedFile);
                        setCropSrc(null);
                    }}
                    onCancel={() => setCropSrc(null)}
                />
            )}
            {logoutModalOpen && (
                <ConfirmModal
                    isOpen={logoutModalOpen}
                    onConfirm={() =>
                        logout({
                            logoutParams: { returnTo: window.location.origin },
                        })
                    }
                    onCancel={() => setLogoutModalOpen(false)}
                    message={text.logOutConfirm}
                    confirmLabel={text.logOut}
                />
            )}
            <LoadingOverlay isVisible={uploading || savingName} />
        </div>
    );
}
