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
    "Mission Bay Café",
    "Rosebank Café & Kitchen",
    "Rude Boy",
    "The Candy Shop",
    "The Federal Store",
    "The Garden Shed",
    "Tobi",
    "Twisted Tomato",
    "Winona Forever",
];

export const randomPlaceholder = () =>
    placeholders[Math.floor(Math.random() * placeholders.length)];

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
    next: "Next",
    back: "Back",
    gotIt: "Got it",

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
    editSharedWith: "My Circle",
    noSharedReviews: "You haven't added anyone to your circle yet.",
    enterEmailAddress: "Enter email address",
    sharedWithLabel: "People who can see your reviews",
    showTutorial: "View tutorial",

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
    drinkLabel: "Drink",
    ambienceLabel: "Ambience",
    reviewNotesLabel: "Review notes",
    reviewNotesPlaceholder: "Write your review here...",
    markAsPublic: "Mark as Public",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    draftRestored: "Draft restored",
    clearDraft: "Clear draft",
    clearDraftConfirm: "Clear draft?",
    collaborative: "Collaborative",
    selectContributors: "Select contributors",
    noSharedWithForCollaboration:
        "You haven't added anyone to your circle yet. Add users to your circle and they will appear here.",
    addYourReviewLabel: "You have been added as a collaborator on this review.",
    addYourReview: "Add your review",

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
    makePersonal: "Make Personal",
    confirmDeleteReview: "Are you sure you want to delete this review?",
    leaveCollaboration: "Leave",
    confirmLeaveCollaboration:
        "Are you sure you want to leave this collaboration? Your review will be permanently deleted.",

    // Review list
    noReviews: "No reviews yet.",
    makeGoogleMapsLink: (restaurant_name, place_id) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant_name)}&query_place_id=${place_id}`,
    makeContributorList: (ownerName, contributorNames) => {
        if (contributorNames.length === 0) return ownerName;
        if (contributorNames.length === 1)
            return `${ownerName} & ${contributorNames[0]}`;
        return `${ownerName} +${contributorNames.length}`;
    },

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

const slideText = {
    writeReview: {
        title: "Write reviews",
        sub: "Eat somewhere nice. Rate the food, drinks, and ambience, and share your thoughts.",
    },
    sharing: {
        title: "Share with friends",
        sub: "Add people to your circle to share your reviews, or post publicly to share with everyone.",
    },
    collaborative: {
        title: "Collaborative reviews",
        sub: "Invite others who ate with you to add their perspective in the same review.",
    },
    themes: {
        title: "Themes",
        sub: "Pick a theme. All your reviews will be styled to match, and you can change it whenever you like.",
    },
};

const userSets = [
    [
        {
            initials: "AL",
            name: "A. Linguini",
            bg: "bg-orange-100",
            text: "text-orange-700",
        },
        {
            initials: "R",
            name: "Remy",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "AE",
            name: "Anton E.",
            bg: "bg-gray-100",
            text: "text-gray-700",
        },
    ],
    [
        {
            initials: "LS",
            name: "Luke S.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
        {
            initials: "BK",
            name: "Ben K.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "CT",
            name: "C. Threepio",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "EB",
            name: "E. Bennet",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
        {
            initials: "FD",
            name: "F. Darcy",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "GW",
            name: "G. Wickham",
            bg: "bg-red-100",
            text: "text-red-700",
        },
    ],
    [
        {
            initials: "VB",
            name: "Violet B.",
            bg: "bg-violet-100",
            text: "text-violet-700",
        },
        {
            initials: "VS",
            name: "Veruca S.",
            bg: "bg-red-100",
            text: "text-red-700",
        },
        {
            initials: "MT",
            name: "Mike T.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "FB",
            name: "Ferris B.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "CF",
            name: "Cameron F.",
            bg: "bg-red-100",
            text: "text-red-700",
        },
        {
            initials: "SP",
            name: "Sloane P.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "FJ",
            name: "Fred J.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "VD",
            name: "Velma D.",
            bg: "bg-orange-100",
            text: "text-orange-700",
        },
        {
            initials: "NR",
            name: "Norville R.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
    ],
    [
        {
            initials: "NL",
            name: "N. Lim",
            bg: "bg-purple-100",
            text: "text-purple-700",
        },
        {
            initials: "JO",
            name: "J. Oliver",
            bg: "bg-red-100",
            text: "text-red-700",
        },
        {
            initials: "AL",
            name: "A. Langbein",
            bg: "bg-green-100",
            text: "text-green-700",
        },
    ],
    [
        {
            initials: "NF",
            name: "Ned F.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
        {
            initials: "KB",
            name: "Kent B.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "MS",
            name: "Moe S.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
];

const reviewCardExamples = [
    {
        text: "this meal was too hot.",
        rating: [2],
        theme: "tomato-sauce",
    },
    {
        text: "this meal was too cold.",
        rating: [1],
        theme: "kai-moana",
    },
    {
        text: "this meal was just right.",
        rating: [5],
        theme: "manuka-honey",
    },
    {
        text: "we've had one, yes, but what about second breakfast?",
        rating: [3],
        theme: "smashed-avo",
    },
    {
        text: "I don't like food, I love it. if I don't love it, I don't swallow.",
        rating: [1],
        theme: "blueberry-muffin",
    },
    {
        text: "I drink your milkshake! I drink it up!",
        rating: [5],
        theme: "flat-white",
    },
    {
        text: "do you know what they call the quarter pounder with cheese in france?",
        rating: [3],
        theme: "pav-lover",
    },
    {
        text: "po-tae-toes. boil em, mash em, stick em in a stew.",
        rating: [4],
        theme: "kumara-fries",
    },
    {
        text: "is butter a carb?",
        rating: [2],
        theme: "strawberry-wafer",
    },
];

const restaurantNameExamples = [
    "Gusteau's",
    "Dorsia",
    "Moe's Tavern",
    "Mos Eisley Cantina",
    "The Prancing Pony",
];

export const tutorialExamples = {
    slideText,
    randomUserSet: () => userSets[Math.floor(Math.random() * userSets.length)],
    randomRestaurantName: () =>
        restaurantNameExamples[
            Math.floor(Math.random() * restaurantNameExamples.length)
        ],
    reviewCardExamples,
    reviewTextExample:
        "Really really good. Really really really good. So good.",
    reviewTextExampleCollaborator: "I agree, it was really good.",
    welcomeMessage: [
        "Welcome to two:top!",
        "Here's a quick tutorial to get you started.",
    ],
};
