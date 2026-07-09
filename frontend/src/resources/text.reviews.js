export const textReviews = {
    // Review form
    writeReview: "Write a Review",
    restaurantNameLabel: "Restaurant",
    restaurantNamePlaceholder: (name) => `${name}`,
    restaurantAddressLabel: "Address",
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
    markAsPublicHelper:
        "Make this review visible to everyone, not just your friends.",
    draftRestored: "Draft restored",
    clearDraft: "Clear draft",
    clearDraftConfirm: "Clear draft?",
    collaborative: "Collaborative",
    collaborativeHelper:
        "Invite others to add their own ratings and notes to this review.",
    selectContributors: "Select contributors",
    noSharedWithForCollaboration:
        "You haven't added friends yet. Add friends and they will appear here.",
    addYourReviewLabel: "You have been added as a collaborator on this review.",
    addYourReviewButtonLabel: "Add your review",
    addPhotos: "Add photos",
    searchRestaurant: "Search restaurant...",
    contributionFormHeading: "Add Your Review",

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

    // Errors
    errorFailedSubmit: "Failed to submit review.",
    errorFailedSave: "Failed to save review. Please try again.",
    errorFailedFetch: "Failed to fetch reviews.",
    searchError:
        "Search unavailable. You can still enter the restaurant name and address manually.",
};
