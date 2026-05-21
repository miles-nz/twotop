import { themes } from "./themes";
import { text } from "./resources";

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

export const formatVisitDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const now = new Date();

    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === -1) return text.today;

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export const formatNotificationTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return text.justNow;
    if (diffMins < 60) return text.minutesAgo(diffMins);
    if (diffHours < 24) return text.hoursAgo(diffHours);
    if (diffDays < 7) return text.daysAgo(diffDays);
    return date.toLocaleDateString();
};

export const formatHoverDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    const dayMonthYear = date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return `${weekday} ${dayMonthYear}`;
};

export const formatShortAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",").map((p) => p.trim());
    return parts.slice(-2).join(", ");
};

export const formatSuburb = (address) => {
    if (!address) return "";
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length === 1) return parts[0];
    return parts[1] ?? "";
};

export function applyThemeToCss(themeId, isDarkMode) {
    const themeSet = isDarkMode ? themes.dark : themes.light;
    const theme = themeSet[themeId] || themeSet["default-theme"];
    Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
}

export function getDeviceType() {
    const ua = navigator.userAgent;
    const isTouchDevice = navigator.maxTouchPoints > 0;

    const isTablet =
        /(ipad)/i.test(ua) ||
        // iPads on iOS 13+ report as Macintosh but have touch points
        (/Macintosh/i.test(ua) && isTouchDevice) ||
        (/android/i.test(ua) && !/mobile/i.test(ua));

    const isMobile =
        !isTablet &&
        /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

    if (isTablet) return "tablet";
    if (isMobile) return "mobile";
    return "desktop";
}

export function getOS() {
    const ua = navigator.userAgent;

    if (/iPhone|iPod/.test(ua)) return "ios";
    if (/iPad/.test(ua)) return "ios";
    // iPad on iOS 13+ - must have both Macintosh AND high touch points (5 = full multitouch)
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints >= 5) return "ios";
    if (/android/i.test(ua)) return "android";
    if (/win/i.test(ua)) return "windows";
    if (/mac/i.test(ua)) return "macos";
    return "other";
}

export function makeProfileUrl(userId) {
    return `/profile/${userId?.replace("auth0|", "")}`;
}

export function makeContributorList(ownerName, contributorNames) {
    if (contributorNames.length === 0) return ownerName;
    if (contributorNames.length === 1)
        return `${ownerName} & ${contributorNames[0]}`;
    return `${ownerName} +${contributorNames.length}`;
}
