export const draftKeys = {
    newReview: "twotop-review-draft",
    editReviewPrefix: "twotop-review-draft-edit-",
};
export const preferences = {
    collapseReviewImages: false,
    maxImageSize: 20 * 1024 * 1024,
};

export const STAR_PATH =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

export const placeholders = [
    "Blend Café",
    "Boston Café",
    "Browne St",
    "Daily Bread",
    "Elixir Café",
    "Flying Burrito Brothers",
    "Gerome",
    "Hill House Café",
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
    // General
    add: "Add",
    apply: "Apply",
    save: "Save",
    edit: "Edit",
    editLabel: (valueName) => `Edit ${valueName}`,
    remove: "Remove",
    removeLabel: (valueName) => `Remove ${valueName}`,
    delete: "Delete",
    cancel: "Cancel",
    close: "Close",
    done: "Done",
    saving: "Saving...",
    deleting: "Deleting...",
    yes: "Yes",
    no: "No",

    // App
    appName1: "two",
    appName2: "top",
    appNameSeparator: ":",
    get appName() {
        return `${this.appName1}${this.appNameSeparator}${this.appName2}`;
    },

    // Auth
    logIn: "Log In",
    logOut: "Log Out",

    // User preferences
    theme: "Theme",
    colorModeSystem: "System",
    colorModeLight: "Light",
    colorModeDark: "Dark",
    darkModeToggleLabel: "Dark mode toggle",
    editSharedWith: "Sharing Settings",
    noSharedReviews: "No one can see your private reviews yet.",
    enterEmailAddress: "Enter email address",
    sharedWithLabel: "Who can see my private reviews",

    // Navigation
    writeReview: "Write a Review",
    publicOnly: "Public Only",
    public: "Public",

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
    draftRestored: "Draft restored",
    clearDraft: "Clear draft",
    clearDraftConfirm: "Clear draft?",

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
    invalidEmail: "Please enter a valid email address.",
    userNotFound: "User not found.",
    alreadyHasAccess: "This user already has access.",
    ownReviewAccess: "You can already see your own reviews.",
};

export const enums = {
    inlineEditDisplayMode: {
        valueWithPencil: "valueWithPencil",
        valueOnly: "valueOnly",
        editWithValueName: "editWithValueName",
    },
};
