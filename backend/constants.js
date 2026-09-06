const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://twotop.co.nz",
    "https://www.twotop.co.nz",
    "https://twotop.pages.dev",
];

const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_IMAGES_PER_REVIEW = 5;
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "image/avif",
];
const REVIEW_IMAGE_BUCKET = "review-images";
const PROFILE_PICTURE_BUCKET = "profile-pictures";
const MAX_USER_NAME_LENGTH = 20;
const MAX_RESTAURANT_NAME_LENGTH = 100;
const MAX_REVIEW_TEXT_LENGTH = 2000;
const RATING_MIN = 0.5;
const RATING_MAX = 5;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_BUG_REPORT_LENGTH = 1000;

const ERRORS = {
    reviewNotFound: "Review not found",
    unauthorised: "Unauthorised",
    invalidRestaurantName: "Invalid restaurant name",
    maxPhotos: `Maximum ${MAX_IMAGES_PER_REVIEW} photos per review`,
    invalidRating: (field) => `Invalid ${field}`,
    missingImage: "Image file is required",
    invalidImageType:
        "Only JPEG, PNG, WebP, HEIC, GIF and AVIF images are allowed",
    restaurantNameRequired: "Restaurant name is required.",
    restaurantNameInvalid: "Restaurant name must be a non-empty string.",
    reviewTextInvalid: "Review text must be a string.",
    reviewTextTooLong: `Review text must be ${MAX_REVIEW_TEXT_LENGTH} characters or less.`,
    ratingInvalid: (name) =>
        `${name} must be a number between ${RATING_MIN} and ${RATING_MAX}.`,
    missingRequiredFields: "Review notes or ratings are required.",
    restaurantNameTooLong: `Restaurant name must be ${MAX_RESTAURANT_NAME_LENGTH} characters or less.`,
    userNameTooLong: `Name must be ${MAX_USER_NAME_LENGTH} characters or less.`,
    userNameRequired: "Name is required.",
    userNotFound: "No user found with that email address.",
    invalidEmail: "A valid email address is required.",
    friendRequestSelf: "You cannot send a friend request to yourself.",
    friendRequestExists:
        "You've already sent a request to this person (or they've sent one to you!)",
    friendRequestNotFound: "Friend request not found.",
    notificationNotFound: "Notification not found.",
    invalidUserRequest: "A valid email or user ID is required",
    bugDescriptionRequired: "Please describe the bug.",
    bugDescriptionTooLong: `Description must be ${MAX_BUG_REPORT_LENGTH} characters or less.`,
    bugReportFailed: "Failed to send bug report.",
};

module.exports = {
    ALLOWED_ORIGINS,
    GOOGLE_PLACES_API_URL,
    MAX_FILE_SIZE,
    MAX_IMAGES_PER_REVIEW,
    ALLOWED_IMAGE_TYPES,
    REVIEW_IMAGE_BUCKET,
    PROFILE_PICTURE_BUCKET,
    MAX_USER_NAME_LENGTH,
    MAX_RESTAURANT_NAME_LENGTH,
    MAX_REVIEW_TEXT_LENGTH,
    RATING_MIN,
    RATING_MAX,
    EMAIL_REGEX,
    MAX_BUG_REPORT_LENGTH,
    ERRORS,
};
