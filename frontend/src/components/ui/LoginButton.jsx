import Button from "./Button";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { text } from "../../resources";

function LoginButton({ className }) {
    const { loginWithRedirect } = useAuth0();
    const { pathname } = useLocation();

    return (
        <Button
            variant="surface"
            onClick={() =>
                loginWithRedirect({ appState: { returnTo: pathname } })
            }
            className={className}
        >
            {text.logIn}
        </Button>
    );
}

export default LoginButton;
