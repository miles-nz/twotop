import { useAuth0 } from "@auth0/auth0-react";
import Button from "./Button";

function Navbar() {
    const { user, logout } = useAuth0();

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className="bg-surface-50 border-b border-surface-200 shadow-sm sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-text-dark tracking-tight">
                    Brunch Reviews
                </h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-400 text-white flex items-center justify-center text-sm font-semibold">
                            {user?.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                getInitials(user?.name)
                            )}
                        </div>
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
