import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, List } from "lucide-react";
import ReviewIcon from "../ui/ReviewIcon";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import AvatarDropdown from "./AvatarDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { text, preferences } from "../../resources";
import Logo from "../ui/Logo";
import useNotifications from "../../hooks/useNotifications";
import { useUser } from "../../contexts/UserContext";
import LoginButton from "../ui/LoginButton";

function BellButton({
    user,
    unreadCount,
    notifOpen,
    onBellClick,
    notifications,
    loading,
    error,
    onResolve,
    onClose,
    onMarkAsRead,
}) {
    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onBellClick();
                }}
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
                        error={error}
                        onMarkAsRead={onMarkAsRead}
                        onResolve={onResolve}
                        onClose={onClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function NavbarTitle({ mobile = false }) {
    const navigate = useNavigate();
    return (
        <div
            className="tracking-tight cursor-pointer touch-manipulation"
            onClick={() => navigate("/")}
        >
            <Logo
                size={50}
                showIcon={mobile}
                showText={true}
                colonOverlap={true}
            />
        </div>
    );
}

function Navbar({ onListShareAccepted }) {
    const { user, logout, isAuthenticated } = useAuth0();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { fetchPreferences, setShowTutorial } = useUser();

    const {
        notifications,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markNonActionableAsRead,
        resolveRequest,
        unreadCount,
    } = useNotifications({
        onFriendAccepted: fetchPreferences,
        onListShareAccepted,
        enabled: !!user,
    });

    const location = useLocation();

    useEffect(() => {
        if (user) fetchNotifications();
    }, [location.pathname, fetchNotifications]);

    const handleBellClick = useCallback(async () => {
        if (!notifOpen) {
            setNotifOpen(true);
            const fetched = await fetchNotifications();
            if (fetched) markNonActionableAsRead(fetched);
        } else {
            setNotifOpen(false);
        }
    }, [notifOpen, fetchNotifications, markNonActionableAsRead]);

    const handleCloseNotif = useCallback(() => setNotifOpen(false), []);

    const avatarDropdownProps = useMemo(
        () => ({
            user,
            onLogout: () =>
                logout({ logoutParams: { returnTo: window.location.origin } }),
            showName: true,
        }),
        [user, logout],
    );

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-50">
            {/* Desktop */}
            <div className="hidden md:block">
                <div className="max-w-2xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
                    <div>
                        {user && (
                            <div className="flex items-center gap-4">
                                <NavLink
                                    to="/"
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "text-text-dark"
                                                : "text-text-light hover:text-text-dark"
                                        }`
                                    }
                                >
                                    <ReviewIcon size={18} />
                                    {text.reviews}
                                </NavLink>
                                <NavLink
                                    to="/lists"
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "text-text-dark"
                                                : "text-text-light hover:text-text-dark"
                                        }`
                                    }
                                >
                                    <List size={18} />
                                    {text.lists}
                                </NavLink>
                            </div>
                        )}
                    </div>
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
                            onMarkAsRead={markAsRead}
                            onResolve={resolveRequest}
                            onClose={handleCloseNotif}
                            error={error}
                        />
                        {user ? (
                            <AvatarDropdown {...avatarDropdownProps} />
                        ) : (
                            <LoginButton />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center justify-between bg-surface-50 border-b border-surface-200">
                    {preferences.showMobileMenu ? (
                        <>
                            <div className="w-10 flex items-center justify-start">
                                <button
                                    onClick={() =>
                                        setMobileMenuOpen(!mobileMenuOpen)
                                    }
                                    className="p-2 rounded-lg transition-colors"
                                >
                                    {mobileMenuOpen ? (
                                        <X
                                            size={24}
                                            className="text-text-dark"
                                        />
                                    ) : (
                                        <Menu
                                            size={24}
                                            className="text-text-dark"
                                        />
                                    )}
                                </button>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <NavbarTitle mobile={true} />
                            </div>
                        </>
                    ) : (
                        <NavbarTitle mobile={true} />
                    )}

                    <div className="flex items-center gap-2">
                        <BellButton
                            user={user}
                            unreadCount={unreadCount}
                            notifOpen={notifOpen}
                            onBellClick={handleBellClick}
                            notifications={notifications}
                            loading={loading}
                            onMarkAsRead={markAsRead}
                            onResolve={resolveRequest}
                            onClose={handleCloseNotif}
                            error={error}
                        />
                        {!user && <LoginButton />}
                    </div>
                </div>
                {preferences.showMobileMenu && (
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
                                                        <LoginButton className="w-full" />
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
                )}
                {preferences.showMobileMenu && (
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
                )}
            </div>
        </nav>
    );
}

export default Navbar;
