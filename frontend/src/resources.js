export const draftKeys = {
    newReview: "mimu-review-draft",
    editReviewPrefix: "mimu-review-draft-edit-",
};
export const preferences = {
    collapseReviewImages: false,
    maxImageSize: 20 * 1024 * 1024,
    enableEmojis: false,
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
    appName: "MIMU",
    tagline: "Log in to view and write reviews",

    // Auth
    logIn: "Admin",
    logOut: "Log Out",

    // Navigation
    writeReview: "Write a Review",
    close: "Close",
    publicOnly: "Public Only",

    // Review form
    restaurantNameLabel: "Restaurant Name",
    restaurantNamePlaceholder: (name) => `e.g. ${name}`,
    dateVisitedLabel: "Date Visited",
    ratingsLabel: "Ratings",
    foodLabel: "Food",
    drinksLabel: "Drinks",
    ambienceLabel: "Ambience",
    defaultFoodEmoji: "🍽️",
    defaultDrinkEmoji: "☕️",
    defaultAmbienceEmoji: "✨",
    reviewNotesLabel: "Review notes",
    reviewNotesPlaceholder: "Write your review here...",
    markAsPublic: "Mark as Public",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    edit: "Edit",
    editLabel: (valueName) => `Edit ${valueName}`,
    draftRestored: "Draft restored",
    clearDraft: "Clear draft",

    // Photos
    photo: "Photo",
    addPhotos: "Add Photos",
    editPhotos: "Edit Photos",
    reviewPhoto: "Review photo",
    reviewPhotoIndex: (index) => `Review photo ${index + 1}`,
    photoCount: (count) =>
        `${count} ${count === 1 ? "photo" : "photos"} - tap to view`,
    cropPhoto: "Crop Photo",
    crop: "Crop",
    uploading: "Uploading...",
    uploadPhoto: "Upload photo",
    removePhoto: "Remove photo",
    nextImage: "Next image",
    previousImage: "Previous image",

    // Review card menu
    updateRestaurant: "Update Restaurant",
    editReview: "Edit Review",
    makePublic: "Make Public",
    makePrivate: "Make Private",
    delete: "Delete",
    deleting: "Deleting...",
    cancel: "Cancel",
    confirmDeleteReview: "Are you sure you want to delete this review?",

    // Review list
    noReviews: "No reviews yet.",
    loading: "Loading...",

    // Errors
    errorFormatted: (error) => `Error: ${error}`,
    errorGeneric: "Something went wrong, please try again",
    errorFailedSubmit: "Failed to submit review.",
    errorFailedSave: "Failed to save review. Please try again.",
    errorFailedFetch: "Failed to fetch reviews.",
    errorMaxImages: "You can upload a maximum of 5 images",
    errorImageSize: "Images must be 20MB or less",
};

export const emojiOptions = {
    food: [
        text.defaultFoodEmoji,
        "🍳",
        "🧇",
        "🥪",
        "🥗",
        "🍔",
        "🍕",
        "🥘",
        "🍛",
    ],
    drink: [
        text.defaultDrinkEmoji,
        "🫖",
        "🥤",
        "🧋",
        "🥂",
        "🍻",
        "🍹",
        "🍷",
        "🍸",
    ],
    ambience: [
        text.defaultAmbienceEmoji,
        "🕯️",
        "🪴",
        "🌸",
        "🎵",
        "🎭",
        "🎨",
        "🌅",
        "🏙️",
    ],
};

export const enums = {
    inlineEditDisplayMode: {
        valueWithPencil: "valueWithPencil",
        valueOnly: "valueOnly",
        editWithValueName: "editWithValueName",
    },
};
