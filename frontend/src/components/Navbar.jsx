import { useAuth0 } from "@auth0/auth0-react";
import Button from "./Button";
import Avatar from "./Avatar";

function Navbar() {
    const { user, logout } = useAuth0();

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1
                    style={{ fontFamily: "var(--font-title)" }}
                    className="text-5xl text-text-dark tracking-tight"
                >
                    TBC
                </h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Avatar
                            picture={user?.picture}
                            name={user?.name}
                            size="sm"
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
                        Log out
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
