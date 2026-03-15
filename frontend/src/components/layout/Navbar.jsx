import { useAuth0 } from "@auth0/auth0-react";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { text } from "../../resources";

function Navbar() {
    const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0();

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1
                    style={{
                        fontFamily: "var(--font-title)",
                        background:
                            "linear-gradient(0deg, var(--color-user1-primary), var(--color-gradient-mid), var(--color-user2-primary))",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                    className="text-5xl tracking-tight"
                >
                    {text.appName}
                </h1>
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    name={user?.name}
                                    picture={user?.picture}
                                />
                                <span className="text-sm text-text-mid hidden sm:block">
                                    {user?.name}
                                </span>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    logout({
                                        logoutParams: {
                                            returnTo: window.location.origin,
                                        },
                                    })
                                }
                            >
                                {text.logOut}
                            </Button>
                        </>
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
        </nav>
    );
}

export default Navbar;
