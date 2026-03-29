// Smooth scroll to top fallback for browsers without native support
export function smoothScrollToTop(duration = 400) {
    const start =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
    const startTime = performance.now();

    function scrollStep(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 0.5 * (1 - Math.cos(Math.PI * progress)); // easeInOut
        const newY = start * (1 - ease);
        window.scrollTo(0, newY);
        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        }
    }

    requestAnimationFrame(scrollStep);
}

export const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export const isDefaultAvatar = (url) =>
    !url ||
    url.includes("gravatar.com") ||
    url.includes("cdn.auth0.com/avatars");
