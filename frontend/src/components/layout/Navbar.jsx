import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "../ui/Button";
import AvatarDropdown from "./AvatarDropdown";
import { text } from "../../resources";
import PublicToggle from "./PublicToggle";
import Logo from "../ui/Logo";

function Navbar({
    isPublic = false,
    onTogglePublic,
    currentUserName,
    onNameUpdated,
    currentUserPicture,
    onPictureUpdated,
    isDarkMode,
    onToggleDarkMode,
    currentThemeId,
    onThemeChange,
    onThemePreview,
    sharedWith,
    onSharedWithChange,
}) {
    const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleTitleClick = () => {
        window.location.href = "/";
    };

    const title = (
        <div
            className="tracking-tight cursor-pointer touch-manipulation"
            onClick={handleTitleClick}
        >
            <Logo
                size={50}
                showIcon={false}
                showText={true}
                colonOverlap={true}
            />
        </div>
    );

    const avatarDropdownProps = {
        user,
        onLogout: () =>
            logout({ logoutParams: { returnTo: window.location.origin } }),
        showName: true,
        currentUserName,
        onNameUpdated,
        currentUserPicture,
        onPictureUpdated,
        isDarkMode,
        onToggleDarkMode,
        currentThemeId,
        onThemeChange,
        onThemePreview,
        sharedWith,
        onSharedWithChange,
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
                        {user ? (
                            <div className="hidden lg:block">
                                <AvatarDropdown {...avatarDropdownProps} />
                            </div>
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
                        <Button
                            variant="surface"
                            onClick={() => loginWithRedirect()}
                        >
                            {text.logIn}
                        </Button>
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
                                    {!user && (
                                        <div className="px-4 pb-6 mt-auto">
                                            <Button
                                                variant="surface"
                                                onClick={loginWithRedirect}
                                                className="w-full"
                                            >
                                                {text.logIn}
                                            </Button>
                                        </div>
                                    )}
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
