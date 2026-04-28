import { useState, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import Button from "../ui/Button";
import AvatarDropdown from "./AvatarDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { text } from "../../resources";
import Logo from "../ui/Logo";
import useNotifications from "../../hooks/useNotifications";
import { useUser } from "../../contexts/UserContext";

function BellButton({
    user,
    unreadCount,
    notifOpen,
    onBellClick,
    notifications,
    loading,
    onResolve,
    onClose,
}) {
    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={onBellClick}
                className="p-1.5 text-text-light hover:text-text-dark transition-colors"
                aria-label={text.notifications}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#960200" }}
                    />
                )}
            </button>
            <AnimatePresence>
                {notifOpen && (
                    <NotificationDropdown
                        notifications={notifications}
                        loading={loading}
                        onResolve={onResolve}
                        onClose={onClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function NavbarTitle() {
    return (
        <div
            className="tracking-tight cursor-pointer touch-manipulation"
            onClick={() => {
                window.location.href = "/";
            }}
        >
            <Logo
                size={50}
                showIcon={false}
                showText={true}
                colonOverlap={true}
            />
        </div>
    );
}

function Navbar({ onPictureUpdated, onNameUpdated, onShowTutorial }) {
    const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { fetchPreferences } = useUser();

    const {
        notifications,
        loading,
        fetchNotifications,
        markNonActionableAsRead,
        resolveRequest,
        unreadCount,
    } = useNotifications({
        onFriendAccepted: fetchPreferences,
        enabled: !!user,
    });

    const handleBellClick = useCallback(async () => {
        if (!notifOpen) {
            const fetched = await fetchNotifications();
            if (fetched) markNonActionableAsRead(fetched);
        }
        setNotifOpen((v) => !v);
    }, [notifOpen, fetchNotifications, markNonActionableAsRead]);

    const handleCloseNotif = useCallback(() => setNotifOpen(false), []);

    const avatarDropdownProps = useMemo(
        () => ({
            user,
            onLogout: () =>
                logout({ logoutParams: { returnTo: window.location.origin } }),
            showName: true,
            onPictureUpdated,
            onNameUpdated,
            onShowTutorial,
        }),
        [user, logout, onPictureUpdated, onNameUpdated, onShowTutorial],
    );

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-50">
            {/* Desktop */}
            <div className="hidden md:block">
                <div className="max-w-2xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
                    <div />
                    <div className="justify-self-center">
                        <NavbarTitle />
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                        <BellButton
                            user={user}
                            unreadCount={unreadCount}
                            notifOpen={notifOpen}
                            onBellClick={handleBellClick}
                            notifications={notifications}
                            loading={loading}
                            onResolve={resolveRequest}
                            onClose={handleCloseNotif}
                        />
                        {user ? (
                            <AvatarDropdown {...avatarDropdownProps} />
                        ) : (
                            <Button
                                variant="surface"
                                onClick={() => loginWithRedirect()}
                            >
                                {text.logIn}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center justify-between bg-surface-50 border-b border-surface-200">
                    <div className="w-20 flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} className="text-text-dark" />
                            ) : (
                                <Menu size={24} className="text-text-dark" />
                            )}
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <NavbarTitle />
                    </div>

                    <div className="w-24 flex items-center justify-end gap-2">
                        <BellButton
                            user={user}
                            unreadCount={unreadCount}
                            notifOpen={notifOpen}
                            onBellClick={handleBellClick}
                            notifications={notifications}
                            loading={loading}
                            onResolve={resolveRequest}
                            onClose={handleCloseNotif}
                        />
                        {user ? (
                            <AvatarDropdown
                                {...avatarDropdownProps}
                                mobile={true}
                            />
                        ) : (
                            <Button
                                variant="surface"
                                onClick={loginWithRedirect}
                            >
                                {text.logIn}
                            </Button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: -250 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -250 }}
                                transition={{ duration: 0.3 }}
                                className="fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-surface-200 shadow-lg overflow-y-auto z-30"
                            >
                                <div className="relative">
                                    <div
                                        className="flex items-center justify-center mx-5 pt-2"
                                        style={{
                                            height: "56px",
                                            touchAction: "manipulation",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Logo
                                            size={50}
                                            showIcon={true}
                                            showText={false}
                                            colonOverlap={true}
                                            disableAnimation={true}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-[calc(100vh-56px)]">
                                    <div className="px-4 py-2 flex-1 overflow-y-auto">
                                        <div className="pt-2 border-t border-surface-200 space-y-4">
                                            {!isAuthenticated && (
                                                <div className="py-2">
                                                    <Button
                                                        variant="surface"
                                                        onClick={
                                                            loginWithRedirect
                                                        }
                                                        className="w-full"
                                                    >
                                                        {text.logIn}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed left-4 top-3 p-2 z-50 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-text-dark" />
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 z-20 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}

export default Navbar;
