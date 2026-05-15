export const draftKeys = {
    newReview: "twotop-review-draft",
    editReviewPrefix: "twotop-review-draft-edit-",
};
export const preferences = {
    collapseReviewImages: false,
    maxImageSize: 20 * 1024 * 1024,
    minSearchCharacters: 3,
    pullRefreshThreshold: 100,
    showMobileMenu: false,
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
    sending: "Sending...",
    pending: "Pending",
    cancelling: "Canceling...",
    loading: "Loading...",
    uploading: "Uploading...",
    yes: "Yes",
    no: "No",
    next: "Next",
    back: "Back",
    gotIt: "Got it",
    show: "Show",
    hide: "Hide",
    to: "to",
    other: "other",
    accept: "Accept",
    decline: "Decline",
    dismiss: "Dismiss",
    send: "Send",
    share: "Share",
    restaurant: "restaurant",
    restaurants: "restaurants",

    // App
    appName1: "two",
    appName2: "top",
    appNameSeparator: ":",
    get appName() {
        return `${this.appName1}${this.appNameSeparator}${this.appName2}`;
    },
    reviews: "Reviews",
    lists: "Lists",

    // Auth
    logIn: "Log In",
    logOut: "Log Out",

    // Profile / User preferences
    theme: "Theme",
    colorModeSystem: "System",
    colorModeLight: "Light",
    colorModeDark: "Dark",
    darkModeToggleLabel: "Dark mode toggle",
    darkMode: "Dark mode",
    friendsLabel: "Friends",
    noSharedReviews: "You haven't added any friends yet.",
    addFriendInputPlaceholder: "Enter a user's email address",
    showTutorial: "View tutorial",
    profile: "Profile",
    shareProfile: "Share profile",
    appearance: "Appearance",
    logOutConfirm: "Are you sure you want to log out?",
    memberSince: "Member since",
    reviewCountLabel: (count) => `${count} review${count === 1 ? "" : "s"}`,
    listCountLabel: (count) => `${count} list${count === 1 ? "" : "s"}`,
    featuredLists: "Featured Lists",
    settings: "Settings",

    // Notifications / Friend Requests
    notifications: "Notifications",
    noNotifications: "No notifications",
    sentYouAFriendRequest: " sent you a friend request.",
    acceptedYourFriendRequest: " accepted your friend request.",
    requestAccepted: "Request accepted!",
    requestDeclined: "Request declined.",
    friendRequestLabel:
        "Send a friend request to people you want to share reviews with.",
    friendRequestSent: "Friend request sent!",
    sharedAListWithYou: " shared a list with you: ",
    acceptedYourListShare: " accepted your invite to ",
    updatedYourList: " made changes to ",
    leftYourList: " left your list ",
    viewList: "View list",
    addedYouAsContributor: " added you as a contributor to a review of ",
    viewReview: "View review",
    addFriend: "Add Friend",

    // Review form
    writeReview: "Write a Review",
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
        "You haven't added friends yet. Add friends and they will appear here.",
    addYourReviewLabel: "You have been added as a collaborator on this review.",
    addYourReview: "Add your review",
    searchRestaurant: "Search restaurant...",
    markAsPublicHelper:
        "Make this review visible to everyone, not just your friends.",
    collaborativeHelper:
        "Invite others to add their own ratings and notes to this review.",

    // Photos
    photo: "Photo",
    photoCount: (count) =>
        `${count} ${count === 1 ? "photo" : "photos"} - tap to view`,
    cropPhoto: "Crop Photo",
    uploadPhoto: "Upload photo",
    removePhoto: "Remove photo",
    nextImage: "Next image",
    previousImage: "Previous image",
    goToImage: (index, length) => `Go to image ${index + 1} of ${length}`,

    // Review card
    reviewCardMenu: "Review card menu",
    makePublic: "Make Public",
    makePersonal: "Make Personal",
    confirmDeleteReview: "Are you sure you want to delete this review?",
    leaveCollaboration: "Leave",
    confirmLeaveCollaboration:
        "Are you sure you want to leave this collaboration? Your review will be permanently deleted.",
    shareReview: "Share review",
    privateReview: "This review is private.",
    privateReviewLoginMessage: "Log in to view your friends' reviews.",
    forbiddenReviewMessage: "You don't have access to this review.",

    // Review list
    noReviews: "No reviews yet.",
    makeGoogleMapsLink: (restaurant_name, place_id) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant_name)}&query_place_id=${place_id}`,

    // Search / filters
    dateRangeLabel: "Date range",
    specificUserLabel: "Specific user",
    collaborativeReviewsOnly: "Collaborative reviews only",
    hasPhotosLabel: "Has photos",
    hasVerifiedAddressLabel: "Has verified address",
    clearFilters: "Clear filters",
    clickOrDrag: "Click for a minimum rating or drag to select a range",
    minAndAbove: (min) => `${min}★ and above`,
    minToMax: (min, max) => `${min}★ to ${max}★`,
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    highestRated: "Highest rated",
    lowestRated: "Lowest rated",
    allLabel: "All",
    mineLabel: "Mine",
    publicLabel: "Public",
    showAdvancedFilters: "Show advanced filters",
    hideAdvancedFilters: "Hide advanced filters",
    noReviewsMatch: "No reviews match your filters.",
    filtersLabel: "Filters",

    // Lists
    createList: "Create List",
    listNameLabel: "Name",
    listNamePlaceholder: "e.g. Best Cafés",
    listDescriptionLabel: "Description (optional)",
    listDescriptionPlaceholder: "e.g. My favourite cafés in Auckland",
    listAddRestaurantsLabel: "Add restaurants",
    restaurantCount: (count) =>
        `${count} ${count === 1 ? "restaurant" : "restaurants"}`,
    sharedWithCount: (count) => `${count} ${count === 1 ? "person" : "people"}`,
    canEdit: "Can edit",
    canView: "Can view",
    noLists: "You haven't created any lists yet. Tap + to get started.",
    shareList: "Share list",
    deleteList: "Delete list",
    leaveList: "Leave list",
    confirmDeleteList: "Delete this list?",
    confirmLeaveList: "Leave this list?",
    noRestaurantsEdit: "No restaurants yet. Search above to add one.",
    noRestaurantsView: "No restaurants on this list yet.",
    permissionLabel: "Permission",
    allFriendsShared: "All your friends already have access to this list.",
    noFriendsToShare: "Add friends first before sharing a list.",
    notSharedYet: "This list hasn't been shared with anyone yet.",
    listNoRestaurantsYet: "Search for restaurants to add them to your list.",
    addDescription: "Add description",
    owner: "Owner",
    checklistMode: "Checklist mode",
    checklistModeDescription: "Track which restaurants you've visited",
    check: "Mark as visited",
    uncheck: "Mark as not visited",
    checklistProgress: (checked, total) => `${checked}/${total} visited`,
    moveCheckedToBottom: "Move checked to bottom",
    shareViaLink: "Share via link",
    generateLink: "Generate link",
    generating: "Generating...",
    revokeLink: "Revoke link",
    confirmRevokeLink: "Anyone with the link will lose access. Are you sure?",
    copy: "Copy",
    listNotFound: "List not found.",
    featureList: "Feature on profile",
    confirmRevokeFeatured:
        "This will also remove this list from your profile. Are you sure?",
    addManualRestaurant: (name) => `Add "${name}"`,
    addAddress: "Add address",
    addressPlaceholder: "Enter address",
    saving: "Saving...",

    // Errors
    errorFormatted: (error) => `Error: ${error}`,
    errorPleaseTryAgain: "Please try again.",
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
    selfFriendRequest: "You're already your own friend!",
    errorFailedRemoveFriend: "Failed to remove friend.",
    errorFailedCancelRequest: "Failed to cancel request.",

    // Time / Utils
    today: "Today",
    justNow: "Just now",
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    daysAgo: (n) => `${n}d ago`,
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
        sub: "Grab a nice meal, then rate the food, drinks, and ambience, and share your thoughts.",
    },
    sharing: {
        title: "Share with friends",
        sub: "Add friends to share your reviews, or post publicly to share with everyone.",
    },
    collaborative: {
        title: "Collaborative reviews",
        sub: "Invite others who ate with you to add their perspective in the same review.",
    },
    themes: {
        title: "Themes",
        sub: "Pick a theme. All your reviews will be styled to match, and you can change it whenever you like.",
    },
    lists: {
        title: "Lists",
        sub: "Create lists of your favourite restaurants, or ones you want to try. Enable checklist mode to tick them off as you go.",
    },
};

const specialUsers = (() => {
    try {
        return JSON.parse(import.meta.env.VITE_SPECIAL_USERS || "[]");
    } catch {
        return [];
    }
})();

const userSets = [
    [
        {
            initials: "AL",
            name: "A. Linguini",
            bg: "bg-orange-100",
            text: "text-orange-700",
        },
        {
            initials: "RR",
            name: "Remy R.",
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
            initials: "HS",
            name: "Homer S.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
        {
            initials: "LL",
            name: "Lenny L.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
        {
            initials: "CC",
            name: "Carl C.",
            bg: "bg-pink-100",
            text: "text-pink-700",
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
    "Chez Quis",
    "Dex's Diner",
    "Dorsia",
    "Gusteau's",
    "Los Pollos Hermanos",
    "Moe's Tavern",
    "Mos Eisley Cantina",
    "The Prancing Pony",
    "The Winchester",
];

const listSets = [
    {
        listName: "Fine Dining",
        restaurants: ["Chez Quis", "The Gilded Truffle", "Dorsia"],
    },
    {
        listName: "Animated Atmosphere",
        restaurants: ["Pizza Planet", "The Krusty Krab", "The Poison Apple"],
    },
    {
        listName: "For the Family Man",
        restaurants: ["Moe's Tavern", "The Drunken Clam", "Bob's Burgers"],
    },

    {
        listName: "Fast Food Spots",
        restaurants: [
            "Big Kahuna Burger",
            "Los Pollos Hermanos",
            "Cluckin' Bell",
        ],
    },
    {
        listName: "Worth the Trip",
        restaurants: ["Mos Eisley Cantina", "End Of Line Club", "Milliways"],
    },
];

export const tutorialExamples = {
    slideText,
    randomUserSet: () => userSets[Math.floor(Math.random() * userSets.length)],
    randomRestaurantName: () =>
        restaurantNameExamples[
            Math.floor(Math.random() * restaurantNameExamples.length)
        ],

    getUserSetForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        if (!specialUser) return null;
        return (
            userSets.find(
                (set) => set[0].name === specialUser.defaultUserSet,
            ) ?? null
        );
    },
    getRestaurantNameForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        return specialUser?.defaultRestaurantName ?? null;
    },
    reviewCardExamples,
    reviewTextExample:
        "Really really good. Really really really good. So good.",
    reviewTextExampleCollaborator: "I agree, it was really good.",
    welcomeMessage: [
        "Welcome to two:top!",
        "Here's a quick tutorial to get you started.",
    ],
    nextUserSet: (currentSet) => {
        const currentIndex = userSets.findIndex(
            (set) => set[0].name === currentSet[0].name,
        );
        const nextIndex = (currentIndex + 1) % userSets.length;
        return userSets[nextIndex];
    },
    randomListSet: () => listSets[Math.floor(Math.random() * listSets.length)],
    getListSetForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        if (!specialUser) return null;
        return (
            listSets.find((s) => s.listName === specialUser.defaultListName) ??
            null
        );
    },
};
