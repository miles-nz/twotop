import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import Navbar from "./components/Navbar";
import Button from "./components/Button";

function App() {
    const { isLoading, isAuthenticated, user, loginWithRedirect, logout } =
        useAuth0();

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleReviewSubmitted = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-surface-100 flex items-center justify-center">
                <p className="text-text-light">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-surface-100 flex items-center justify-center">
                <div className="bg-surface-50 rounded-2xl shadow-md p-8 w-full max-w-md text-center border border-surface-200">
                    <h1 className="text-3xl font-bold text-text-dark mb-2">
                        Brunch Reviews
                    </h1>
                    <p className="text-text-light mb-6">
                        Log in to view and write reviews
                    </p>
                    <Button onClick={() => loginWithRedirect()}>Log in</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-surface-100">
            <Navbar />
            <div className="max-w-2xl mx-auto py-10 px-4">
                <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
                <ReviewList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}

export default App;
