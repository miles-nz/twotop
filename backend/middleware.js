const { auth } = require("express-oauth2-jwt-bearer");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ERRORS } = require("./constants");

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(ERRORS.invalidImageType));
        }
    },
});

const placesRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Too many searches, please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

const friendRequestRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many friend requests, please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

const bugReportRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: "Too many bug reports, please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Too many requests, please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

module.exports = {
    checkJwt,
    upload,
    placesRateLimit,
    friendRequestRateLimit,
    bugReportRateLimit,
    generalRateLimit,
};
