export const draftKeys = {
    newReview: "twotop-review-draft",
    editReviewPrefix: "twotop-review-draft-edit-",
};
export const preferences = {
    collapseReviewImages: false,
    maxImageSize: 20 * 1024 * 1024,
};

export const placeholders = [
    "Blend Café",
    "Boston Café",
    "Browne St",
    "Daily Bread",
    "Elixir Café",
    "Flying Burrito Brothers",
    "Gerome",
    "Honey Café",
    "Humbug",
    "Jam Organic Café",
    "Kokodak",
    "Leafé",
    "Lola",
    "Major Tom",
    "McCafé",
    "Mission Bay Café",
    "Rosebank Café & Kitchen",
    "Rude Boy",
    "Starbucks",
    "The Candy Shop",
    "The Federal Store",
    "The Garden Shed",
    "Tobi",
    "Twisted Tomato",
    "Winona Forever",
];

export const text = {
    // App
    appName1: "two",
    appName2: "top",
    appNameSeparator: ":",
    get appName() {
        return `${this.appName1}${this.appNameSeparator}${this.appName2}`;
    },

    // Auth
    logIn: "Admin",
    logOut: "Log Out",

    // Navigation
    writeReview: "Write a Review",
    close: "Close",
    publicOnly: "Public Only",
    public: "Public",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    toggleDarkMode: "Toggle dark mode",

    // Review form
    restaurantNameLabel: "Restaurant",
    restaurantNamePlaceholder: (name) => `e.g. ${name}`,
    restaurantAddressLabel: "Address (optional)",
    restaurantAddressPlaceholder: "e.g. 123 Queen St, Auckland CBD, Auckland",
    searchingPlaces: "Searching...",
    noPlacesFound: "No results found",
    clearPlace: "Clear selection",
    dateVisitedLabel: "Date Visited",
    ratingsLabel: "Ratings",
    foodLabel: "Food",
    drinksLabel: "Drinks",
    ambienceLabel: "Ambience",
    reviewNotesLabel: "Review notes",
    reviewNotesPlaceholder: "Write your review here...",
    markAsPublic: "Mark as Public",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    edit: "Edit",
    editLabel: (valueName) => `Edit ${valueName}`,
    draftRestored: "Draft restored",
    clearDraft: "Clear draft",
    clearDraftConfirm: "Clear draft?",
    yes: "Yes",
    no: "No",

    // Photos
    photo: "Photo",
    photoCount: (count) =>
        `${count} ${count === 1 ? "photo" : "photos"} - tap to view`,
    cropPhoto: "Crop Photo",
    uploading: "Uploading...",
    uploadPhoto: "Upload photo",
    removePhoto: "Remove photo",
    nextImage: "Next image",
    previousImage: "Previous image",
    goToImage: (index, length) => `Go to image ${index + 1} of ${length}`,

    // Review card menu
    makePublic: "Make Public",
    makePrivate: "Make Private",
    delete: "Delete",
    deleting: "Deleting...",
    cancel: "Cancel",
    confirmDeleteReview: "Are you sure you want to delete this review?",

    // Review list
    noReviews: "No reviews yet.",
    makeGoogleMapsLink: (restaurant_name, place_id) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant_name)}&query_place_id=${place_id}`,

    // Errors
    errorFormatted: (error) => `Error: ${error}`,
    errorGeneric: "Something went wrong, please try again",
    errorFailedSubmit: "Failed to submit review.",
    errorFailedSave: "Failed to save review. Please try again.",
    errorFailedFetch: "Failed to fetch reviews.",
    errorMaxImages: "You can upload a maximum of 5 images",
    errorImageSize: "Images must be 20MB or less",
    searchError:
        "Search unavailable. You can still enter the restaurant name and address manually.",
};

export const enums = {
    inlineEditDisplayMode: {
        valueWithPencil: "valueWithPencil",
        valueOnly: "valueOnly",
        editWithValueName: "editWithValueName",
    },
};
