import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import Button from "../ui/Button";
import AvatarDropdown from "./AvatarDropdown";
import { text } from "../../resources";
import PublicToggle from "./PublicToggle";

function Navbar({
    isPublic = false,
    onTogglePublic,
    currentUserPicture,
    onPictureUpdated,
}) {
    const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileAdminButton, setShowMobileAdminButton] = useState(false);
    const [showDesktopAdminButton, setShowDesktopAdminButton] = useState(false);
    const desktopAdminTimer = useRef(null);
    const desktopAdminHideTimer = useRef(null);
    const ignoreNextDesktopClick = useRef(false);
    const menuAdminTriggerTimer = useRef(null);
    const menuAdminHideTimer = useRef(null);

    // Desktop (main navbar) long-press admin trigger
    const startDesktopAdminTrigger = () => {
        ignoreNextDesktopClick.current = false;
        window.clearTimeout(desktopAdminTimer.current);
        desktopAdminTimer.current = window.setTimeout(() => {
            setShowDesktopAdminButton(true);
            ignoreNextDesktopClick.current = true;
            window.clearTimeout(desktopAdminHideTimer.current);
            desktopAdminHideTimer.current = window.setTimeout(() => {
                setShowDesktopAdminButton(false);
            }, 10000); // 10 seconds
        }, 700);
    };
    const endDesktopAdminTrigger = () => {
        window.clearTimeout(desktopAdminTimer.current);
    };

    // Mobile side menu admin trigger
    const startMenuAdminTrigger = () => {
        window.clearTimeout(menuAdminTriggerTimer.current);
        menuAdminTriggerTimer.current = window.setTimeout(() => {
            setShowMobileAdminButton(true);
            window.clearTimeout(menuAdminHideTimer.current);
            menuAdminHideTimer.current = window.setTimeout(() => {
                setShowMobileAdminButton(false);
            }, 10000); // 10 seconds
        }, 700);
    };
    const endMenuAdminTrigger = () => {
        window.clearTimeout(menuAdminTriggerTimer.current);
    };

    useEffect(() => {
        return () => {
            window.clearTimeout(desktopAdminTimer.current);
            window.clearTimeout(desktopAdminHideTimer.current);
            window.clearTimeout(menuAdminTriggerTimer.current);
            window.clearTimeout(menuAdminHideTimer.current);
        };
    }, []);

    // Desktop/main title click navigates home unless long-press
    const handleTitleClick = () => {
        if (ignoreNextDesktopClick.current) {
            ignoreNextDesktopClick.current = false;
            return;
        }
        window.location.href = "/";
    };

    const title = (
        <h1
            style={{
                fontFamily: "var(--font-title)",
                background:
                    "linear-gradient(0deg, var(--color-user1-primary), var(--color-gradient-mid), var(--color-user2-primary))",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                touchAction: "manipulation",
                cursor: "pointer",
            }}
            className="text-5xl tracking-tight"
            onClick={handleTitleClick}
            onPointerDown={(e) => {
                // Only trigger on desktop (md and up)
                if (window.innerWidth >= 768) startDesktopAdminTrigger();
            }}
            onPointerUp={(e) => {
                if (window.innerWidth >= 768) endDesktopAdminTrigger();
            }}
            onPointerCancel={(e) => {
                if (window.innerWidth >= 768) endDesktopAdminTrigger();
            }}
        >
            {text.appName}
        </h1>
    );

    const avatarDropdownProps = {
        user,
        onLogout: () =>
            logout({ logoutParams: { returnTo: window.location.origin } }),
        showName: true,
        currentUserPicture,
        onPictureUpdated,
    };

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-50">
            {/* Desktop Navbar */}
            <div className="hidden md:block">
                <div className="max-w-2xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
                    <div className="flex items-center gap-6">
                        {isAuthenticated && (
                            <PublicToggle
                                isPublic={isPublic}
                                onToggle={onTogglePublic}
                            />
                        )}
                    </div>

                    <div className="justify-self-center">{title}</div>

                    <div className="flex items-center gap-6 justify-end">
                        {user && (
                            <div className="hidden lg:block">
                                <AvatarDropdown {...avatarDropdownProps} />
                            </div>
                        )}
                        {!isAuthenticated && (
                            <AnimatePresence>
                                {showDesktopAdminButton && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        key="admin-desktop-btn"
                                    >
                                        <Button
                                            variant="surface"
                                            onClick={() => loginWithRedirect()}
                                        >
                                            {text.logIn}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className="md:hidden sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center justify-between bg-surface-50 border-b border-surface-200">
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

                    <div className="flex-1 flex justify-center">{title}</div>

                    {user ? (
                        <AvatarDropdown
                            {...avatarDropdownProps}
                            mobile={true}
                        />
                    ) : (
                        <span className="p-2 rounded-lg invisible">
                            <Search size={24} className="text-text-dark" />
                        </span>
                    )}
                </div>

                {/* Mobile Menu */}
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
                                {/* Side menu app name absolutely positioned at the top, centered and large, aligned with close button */}
                                <div
                                    className="relative"
                                    style={{ height: "56px" }}
                                >
                                    <div
                                        className="absolute left-0 right-0 top-4 flex justify-center items-center select-none cursor-pointer"
                                        style={{
                                            fontFamily: "var(--font-title)",
                                            background:
                                                "linear-gradient(0deg, var(--color-user1-primary), var(--color-gradient-mid), var(--color-user2-primary))",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            touchAction: "manipulation",
                                            fontSize: "2.25rem",
                                            fontWeight: 100,
                                            height: "48px",
                                            lineHeight: "48px",
                                        }}
                                        onPointerDown={startMenuAdminTrigger}
                                        onPointerUp={endMenuAdminTrigger}
                                        onPointerCancel={endMenuAdminTrigger}
                                    >
                                        {text.appName}
                                    </div>
                                </div>
                                <div className="flex flex-col h-[calc(100vh-56px)]">
                                    <div className="px-4 py-4 flex-1 overflow-y-auto">
                                        <div className="pt-2 border-t border-surface-200 space-y-4">
                                            <div className="py-2">
                                                {isAuthenticated && (
                                                    <PublicToggle
                                                        isPublic={isPublic}
                                                        onToggle={
                                                            onTogglePublic
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Admin button at the bottom */}
                                    <div className="px-4 pb-6 mt-auto">
                                        <AnimatePresence>
                                            {showMobileAdminButton && !user && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                    key="admin-mobile-btn"
                                                >
                                                    <Button
                                                        variant="surface"
                                                        onClick={
                                                            loginWithRedirect
                                                        }
                                                        className="w-full"
                                                    >
                                                        {text.logIn}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed left-4 top-4 p-2 z-50 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-text-dark" />
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* Mobile Menu Overlay */}
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
