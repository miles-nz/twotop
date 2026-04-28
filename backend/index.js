require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const supabase = require("./supabase");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const sharp = require("sharp");

// Config
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://mimu-reviews.vercel.app",
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

// Errors
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
    missingRequiredFields: "Review notes or all ratings are required.",
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
};

// Multer setup
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

const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Too many requests, please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

const app = express();
app.set("trust proxy", 1);

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(generalRateLimit);

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

// Helpers
const uploadImage = async (file, userId, bucket = REVIEW_IMAGE_BUCKET) => {
    const sanitizedUserId = userId.replace(/\|/g, "-");
    const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
    );
    const filename = `${sanitizedUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${sanitizedFilename}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    const publicUrl = urlData.publicUrl;

    if (bucket !== REVIEW_IMAGE_BUCKET) return { url: publicUrl, lqip: null };

    try {
        const lqipBuffer = await sharp(file.buffer)
            .resize(8, 8, { fit: "cover" })
            .jpeg({ quality: 50 })
            .toBuffer();
        const lqip = `data:image/jpeg;base64,${lqipBuffer.toString("base64")}`;
        return { url: publicUrl, lqip };
    } catch {
        return { url: publicUrl, lqip: null };
    }
};

const getStoragePath = (url) => {
    return decodeURIComponent(url.split(`/${REVIEW_IMAGE_BUCKET}/`)[1]);
};

const deleteImages = async (urls) => {
    if (!urls || urls.length === 0) return;
    const paths = urls.map((url) => getStoragePath(url));
    const { error } = await supabase.storage
        .from(REVIEW_IMAGE_BUCKET)
        .remove(paths);
    if (error) throw new Error(error.message);
};

const attachContributions = async (reviews) => {
    if (!reviews?.length) return reviews ?? [];
    const reviewIds = reviews.map((r) => r.id);
    const { data: contributions } = await supabase
        .from("review_contributions")
        .select("*")
        .in("review_id", reviewIds);
    const byReviewId = (contributions || []).reduce((acc, c) => {
        if (!acc[c.review_id]) acc[c.review_id] = [];
        acc[c.review_id].push(c);
        return acc;
    }, {});
    return reviews.map((r) => ({
        ...r,
        contributions: byReviewId[r.id] || [],
    }));
};

// Validation
const validateReview = (body) => {
    const {
        restaurant_name,
        review_text,
        food_rating,
        drink_rating,
        ambience_rating,
    } = body;
    const errors = [];

    if (!restaurant_name) {
        errors.push(ERRORS.restaurantNameRequired);
    } else if (
        typeof restaurant_name !== "string" ||
        restaurant_name.trim().length === 0
    ) {
        errors.push(ERRORS.restaurantNameInvalid);
    } else if (restaurant_name.trim().length > MAX_RESTAURANT_NAME_LENGTH) {
        errors.push(ERRORS.restaurantNameTooLong);
    }

    if (review_text && typeof review_text !== "string") {
        errors.push(ERRORS.reviewTextInvalid);
    } else if (
        review_text &&
        review_text.trim().length > MAX_REVIEW_TEXT_LENGTH
    ) {
        errors.push(ERRORS.reviewTextTooLong);
    }

    const ratings = { food_rating, drink_rating, ambience_rating };
    for (const [name, value] of Object.entries(ratings)) {
        if (value !== null && value !== undefined && value !== "") {
            const parsed = parseFloat(value);
            if (isNaN(parsed) || parsed < RATING_MIN || parsed > RATING_MAX) {
                errors.push(ERRORS.ratingInvalid(name));
            }
        }
    }

    const missingText = !review_text;
    const missingRatings = !food_rating && !drink_rating && !ambience_rating;
    if (missingText && missingRatings) {
        errors.push(ERRORS.missingRequiredFields);
    }

    return errors;
};

// Management API token cache
let mgmtToken = null;
let mgmtTokenExpiry = null;

const getMgmtToken = async () => {
    if (mgmtToken && mgmtTokenExpiry && Date.now() < mgmtTokenExpiry) {
        return mgmtToken;
    }
    const response = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: process.env.AUTH0_MGMT_CLIENT_ID,
                client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
                audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                grant_type: "client_credentials",
            }),
        },
    );
    const data = await response.json();
    if (!data.access_token)
        throw new Error("Failed to retrieve management token");
    mgmtToken = data.access_token;
    // Cache for 23 hours (token lasts 24)
    mgmtTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return mgmtToken;
};

// Routes
app.get("/reviews", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("user_id, shared_with")
            .filter(
                "shared_with",
                "cs",
                JSON.stringify([{ user_id: user_id }]),
            );

        const sharedByUserIds = (prefs || []).map((p) => p.user_id);

        // Fetch own reviews + shared reviews + collaborative reviews
        // where current user is an allowed contributor
        let query = supabase
            .from("reviews")
            .select("*")
            .order("visit_date", { ascending: false });

        const orConditions = [`user_id.eq.${user_id}`];
        if (sharedByUserIds.length > 0) {
            orConditions.push(`user_id.in.(${sharedByUserIds.join(",")})`);
        }
        orConditions.push(
            `allowed_contributors.cs.${JSON.stringify([{ user_id }])}`,
        );

        const { data, error } = await query.or(orConditions.join(","));

        if (error) return res.status(500).json({ error: error.message });

        const reviews = await attachContributions(data);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/reviews/public", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("is_public", true)
            .order("visit_date", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const reviews = await attachContributions(data);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post(
    "/reviews",
    checkJwt,
    (req, res, next) => {
        upload.array("images", MAX_IMAGES_PER_REVIEW)(req, res, (err) => {
            if (err) return res.status(400).json({ errors: [err.message] });
            next();
        });
    },
    async (req, res) => {
        const errors = validateReview(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        const {
            restaurant_name,
            restaurant_address,
            place_id,
            review_text,
            food_rating,
            drink_rating,
            ambience_rating,
            reviewer_name,
            reviewer_picture,
            visit_date,
            is_public,
            is_collaborative,
            allowed_contributors,
            theme_id,
        } = req.body;
        const user_id = req.auth.payload.sub;

        try {
            const uploadResults = await Promise.all(
                (req.files || []).map((file) => uploadImage(file, user_id)),
            );
            const image_urls = uploadResults.map((r) => r.url);
            const image_lqips = uploadResults.map((r) => r.lqip);

            const { data, error } = await supabase
                .from("reviews")
                .insert([
                    {
                        user_id,
                        restaurant_name: restaurant_name.trim(),
                        restaurant_address: restaurant_address || null,
                        place_id: place_id || null,
                        review_text: review_text ? review_text.trim() : null,
                        food_rating: food_rating
                            ? parseFloat(food_rating)
                            : null,
                        drink_rating: drink_rating
                            ? parseFloat(drink_rating)
                            : null,
                        ambience_rating: ambience_rating
                            ? parseFloat(ambience_rating)
                            : null,
                        reviewer_name: reviewer_name || null,
                        reviewer_picture: reviewer_picture || null,
                        visit_date:
                            visit_date ||
                            new Date().toISOString().split("T")[0],
                        is_public: is_public === "true",
                        is_collaborative: is_collaborative === "true",
                        allowed_contributors: allowed_contributors
                            ? JSON.parse(allowed_contributors)
                            : [],
                        image_urls,
                        image_lqips,
                        theme_id: theme_id || "default-theme",
                    },
                ])
                .select();

            if (error) return res.status(500).json({ error: error.message });
            res.status(201).json({ ...data[0], contributions: [] });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

app.patch(
    "/reviews/:id",
    checkJwt,
    (req, res, next) => {
        upload.array("images", MAX_IMAGES_PER_REVIEW)(req, res, (err) => {
            if (err) return res.status(400).json({ errors: [err.message] });
            next();
        });
    },
    async (req, res) => {
        const { id } = req.params;
        const user_id = req.auth.payload.sub;

        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !review)
            return res.status(404).json({ error: ERRORS.reviewNotFound });
        if (review.user_id !== user_id)
            return res.status(403).json({ error: ERRORS.unauthorised });

        const updates = {};

        if (req.body.is_public !== undefined) {
            updates.is_public =
                req.body.is_public === "true" || req.body.is_public === true;
        }

        if (req.body.is_collaborative !== undefined) {
            updates.is_collaborative =
                req.body.is_collaborative === "true" ||
                req.body.is_collaborative === true;
        }

        if (
            req.body.allowed_contributors !== undefined &&
            updates.is_collaborative !== false
        ) {
            updates.allowed_contributors = JSON.parse(
                req.body.allowed_contributors,
            );
        }

        if (req.body.restaurant_name !== undefined) {
            const name = req.body.restaurant_name.trim();
            if (!name || name.length > MAX_RESTAURANT_NAME_LENGTH) {
                return res
                    .status(400)
                    .json({ error: ERRORS.invalidRestaurantName });
            }
            updates.restaurant_name = name;
        }

        if (req.body.restaurant_address !== undefined) {
            updates.restaurant_address = req.body.restaurant_address || null;
        }

        if (req.body.place_id !== undefined) {
            updates.place_id = req.body.place_id || null;
        }

        if (req.body.review_text !== undefined) {
            updates.review_text = req.body.review_text.trim() || null;
        }

        for (const field of [
            "food_rating",
            "drink_rating",
            "ambience_rating",
        ]) {
            if (req.body[field] !== undefined) {
                const val =
                    req.body[field] === "" ? null : parseFloat(req.body[field]);
                if (
                    val !== null &&
                    (isNaN(val) || val < RATING_MIN || val > RATING_MAX)
                ) {
                    return res
                        .status(400)
                        .json({ error: ERRORS.invalidRating(field) });
                }
                updates[field] = val;
            }
        }

        if (req.body.visit_date !== undefined) {
            updates.visit_date = req.body.visit_date || null;
        }

        try {
            if (req.body.image_urls !== undefined) {
                const updatedUrls = JSON.parse(req.body.image_urls);
                const removedUrls = (review.image_urls || []).filter(
                    (url) => !updatedUrls.includes(url),
                );
                await deleteImages(removedUrls);
                updates.image_urls = updatedUrls;

                // Sync lqips to match remaining urls
                const remainingIndices = (review.image_urls || [])
                    .map((url, i) => (updatedUrls.includes(url) ? i : -1))
                    .filter((i) => i !== -1);
                updates.image_lqips = remainingIndices.map(
                    (i) => (review.image_lqips || [])[i] || null,
                );
            }

            if (req.files && req.files.length > 0) {
                const existingUrls =
                    updates.image_urls || review.image_urls || [];
                if (
                    existingUrls.length + req.files.length >
                    MAX_IMAGES_PER_REVIEW
                ) {
                    return res.status(400).json({ error: ERRORS.maxPhotos });
                }
                const uploadResults = await Promise.all(
                    req.files.map((file) => uploadImage(file, user_id)),
                );
                const newUrls = uploadResults.map((r) => r.url);
                const newLqips = uploadResults.map((r) => r.lqip);
                updates.image_urls = [...existingUrls, ...newUrls];
                updates.image_lqips = [
                    ...(updates.image_lqips || review.image_lqips || []),
                    ...newLqips,
                ];
            }

            const { data, error } = await supabase
                .from("reviews")
                .update(updates)
                .eq("id", id)
                .select();

            if (error) return res.status(500).json({ error: error.message });

            const [reviewWithContributions] = await attachContributions(data);
            res.status(200).json(reviewWithContributions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

app.post("/reviews/:id/contributions", checkJwt, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.payload.sub;

    const { data: review, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !review)
        return res.status(404).json({ error: ERRORS.reviewNotFound });

    const isAllowed = (review.allowed_contributors || []).some(
        (c) => c.user_id === user_id,
    );
    if (!isAllowed) return res.status(403).json({ error: ERRORS.unauthorised });

    const {
        review_text,
        food_rating,
        drink_rating,
        ambience_rating,
        reviewer_name,
        reviewer_picture,
    } = req.body;

    const contribution = {
        review_id: id,
        user_id,
        reviewer_name: reviewer_name || null,
        reviewer_picture: reviewer_picture || null,
        review_text: review_text ? review_text.trim() : null,
        food_rating: food_rating ?? null,
        drink_rating: drink_rating ?? null,
        ambience_rating: ambience_rating ?? null,
        updated_at: new Date().toISOString(),
    };

    try {
        const { data, error } = await supabase
            .from("review_contributions")
            .upsert(contribution, { onConflict: "review_id,user_id" })
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/reviews/:id", checkJwt, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.payload.sub;

    const { data: review, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !review)
        return res.status(404).json({ error: ERRORS.reviewNotFound });
    if (review.user_id !== user_id)
        return res.status(403).json({ error: ERRORS.unauthorised });

    try {
        await deleteImages(review.image_urls);

        const { error: deleteError } = await supabase
            .from("reviews")
            .delete()
            .eq("id", id);

        if (deleteError)
            return res.status(500).json({ error: deleteError.message });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/reviews/:id/contributions", checkJwt, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.payload.sub;

    const { data: review, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !review)
        return res.status(404).json({ error: ERRORS.reviewNotFound });

    // Owner cannot leave their own review
    if (review.user_id === user_id)
        return res.status(403).json({ error: ERRORS.unauthorised });

    const isAllowed = (review.allowed_contributors || []).some(
        (c) => c.user_id === user_id,
    );
    if (!isAllowed) return res.status(403).json({ error: ERRORS.unauthorised });

    try {
        // Delete the contribution
        const { error: deleteError } = await supabase
            .from("review_contributions")
            .delete()
            .eq("review_id", id)
            .eq("user_id", user_id);

        if (deleteError)
            return res.status(500).json({ error: deleteError.message });

        // Remove from allowed_contributors
        const updatedContributors = (review.allowed_contributors || []).filter(
            (c) => c.user_id !== user_id,
        );
        const { error: updateError } = await supabase
            .from("reviews")
            .update({ allowed_contributors: updatedContributors })
            .eq("id", id);

        if (updateError)
            return res.status(500).json({ error: updateError.message });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/user", checkJwt, async (req, res) => {
    const { email } = req.query;

    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: ERRORS.invalidEmail });
    }

    try {
        const token = await getMgmtToken();
        const response = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await response.json();

        if (!data || data.length === 0) {
            return res.status(404).json({ error: ERRORS.userNotFound });
        }

        res.status(200).json({
            user_id: data[0].user_id,
            name: data[0].name,
            picture: data[0].picture,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/user/me", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const token = await getMgmtToken();
        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const userData = await userResponse.json();

        // Ensure user_preferences row exists
        await supabase
            .from("user_preferences")
            .upsert(
                { user_id, updated_at: new Date().toISOString() },
                { onConflict: "user_id", ignoreDuplicates: true },
            );

        res.status(200).json({
            picture: userData.picture,
            name: userData.name,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch(
    "/user/picture",
    checkJwt,
    (req, res, next) => {
        upload.single("picture")(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            next();
        });
    },
    async (req, res) => {
        if (!req.file)
            return res.status(400).json({ error: ERRORS.missingImage });
        const user_id = req.auth.payload.sub;

        try {
            const token = await getMgmtToken();

            // Get current user to find old picture URL
            const userResponse = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const userData = await userResponse.json();
            const oldPictureUrl = userData.picture;

            // Upload new picture to Supabase Storage
            const { url: publicUrl } = await uploadImage(
                req.file,
                user_id,
                PROFILE_PICTURE_BUCKET,
            );

            // Update Auth0 user picture
            const mgmtResponse = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ picture: publicUrl }),
                },
            );

            if (!mgmtResponse.ok) {
                const err = await mgmtResponse.json();
                throw new Error(err.message);
            }

            // Update reviewer_picture on all existing reviews
            const { error: reviewsError } = await supabase
                .from("reviews")
                .update({ reviewer_picture: publicUrl })
                .eq("user_id", user_id);

            if (reviewsError)
                console.error(
                    "Failed to update reviewer pictures:",
                    reviewsError.message,
                );

            // Update reviewer_picture on all existing contributions
            const { error: contributionsError } = await supabase
                .from("review_contributions")
                .update({ reviewer_picture: publicUrl })
                .eq("user_id", user_id);

            if (contributionsError)
                console.error(
                    "Failed to update contribution pictures:",
                    contributionsError.message,
                );

            // Delete old picture from Supabase if it was uploaded by us
            if (
                oldPictureUrl &&
                oldPictureUrl.includes(PROFILE_PICTURE_BUCKET)
            ) {
                const oldPath = decodeURIComponent(
                    oldPictureUrl.split(`/${PROFILE_PICTURE_BUCKET}/`)[1],
                );
                await supabase.storage
                    .from(PROFILE_PICTURE_BUCKET)
                    .remove([oldPath]);
            }

            res.status(200).json({ picture: publicUrl });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

app.delete("/user/picture", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const token = await getMgmtToken();

        // Get current picture to delete from Supabase
        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const userData = await userResponse.json();
        const oldPictureUrl = userData.picture;

        // Clear picture in Auth0
        const mgmtResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ picture: null }),
            },
        );

        if (!mgmtResponse.ok) {
            const err = await mgmtResponse.json();
            throw new Error(err.message);
        }

        // Delete from Supabase if it was uploaded by us
        if (oldPictureUrl && oldPictureUrl.includes(PROFILE_PICTURE_BUCKET)) {
            const oldPath = decodeURIComponent(
                oldPictureUrl.split(`/${PROFILE_PICTURE_BUCKET}/`)[1],
            );
            await supabase.storage
                .from(PROFILE_PICTURE_BUCKET)
                .remove([oldPath]);
        }

        // Update reviewer_picture on all existing reviews
        await supabase
            .from("reviews")
            .update({ reviewer_picture: null })
            .eq("user_id", user_id);

        // Update reviewer_picture on all existing contributions
        await supabase
            .from("review_contributions")
            .update({ reviewer_picture: null })
            .eq("user_id", user_id);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete picture error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.patch("/user/name", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: ERRORS.userNameRequired });
    }

    if (name.trim().length > MAX_USER_NAME_LENGTH) {
        return res.status(400).json({
            error: ERRORS.userNameTooLong,
        });
    }

    try {
        const token = await getMgmtToken();
        const mgmtResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: name.trim() }),
            },
        );

        if (!mgmtResponse.ok) {
            const err = await mgmtResponse.json();
            throw new Error(err.message);
        }

        // Update reviewer_name on all existing reviews
        const { error: reviewsError } = await supabase
            .from("reviews")
            .update({ reviewer_name: name.trim() })
            .eq("user_id", user_id);

        if (reviewsError)
            console.error(
                "Failed to update reviewer names:",
                reviewsError.message,
            );

        res.status(200).json({ name: name.trim() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/user/preferences", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data, error } = await supabase
            .from("user_preferences")
            .select("theme_id, shared_with, has_seen_tutorial")
            .eq("user_id", user_id)
            .single();

        if (error && error.code !== "PGRST116") {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({
            theme_id: data?.theme_id || "default-theme",
            shared_with: data?.shared_with || [],
            has_seen_tutorial: data?.has_seen_tutorial || false,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/user/preferences", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { theme_id, shared_with, has_seen_tutorial } = req.body;

    if (theme_id !== undefined && typeof theme_id !== "string") {
        return res.status(400).json({ error: "Invalid theme_id" });
    }

    if (shared_with !== undefined && !Array.isArray(shared_with)) {
        return res.status(400).json({ error: "Invalid shared_with" });
    }

    if (
        has_seen_tutorial !== undefined &&
        typeof has_seen_tutorial !== "boolean"
    ) {
        return res.status(400).json({ error: "Invalid has_seen_tutorial" });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (theme_id !== undefined) updates.theme_id = theme_id;
    if (shared_with !== undefined) updates.shared_with = shared_with;
    if (has_seen_tutorial !== undefined)
        updates.has_seen_tutorial = has_seen_tutorial;

    try {
        const { error: upsertError } = await supabase
            .from("user_preferences")
            .upsert({ user_id, ...updates });

        if (upsertError)
            return res.status(500).json({ error: upsertError.message });

        if (theme_id !== undefined) {
            const { error: reviewsError } = await supabase
                .from("reviews")
                .update({ theme_id })
                .eq("user_id", user_id);

            if (reviewsError)
                return res.status(500).json({ error: reviewsError.message });
        }

        res.status(200).json({
            ...(theme_id !== undefined && { theme_id }),
            ...(shared_with !== undefined && { shared_with }),
            ...(has_seen_tutorial !== undefined && { has_seen_tutorial }),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/places/search", checkJwt, placesRateLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });
    try {
        const response = await fetch(
            `${GOOGLE_PLACES_API_URL}/places:autocomplete`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                },
                body: JSON.stringify({
                    input: q,
                    includedPrimaryTypes: [
                        "restaurant",
                        "cafe",
                        "bar",
                        "bakery",
                        "food_court",
                    ],
                    locationBias: {
                        rectangle: {
                            low: { latitude: -47.5, longitude: 166.0 },
                            high: { latitude: -34.0, longitude: 178.5 },
                        },
                    },
                    includedRegionCodes: ["nz"],
                }),
            },
        );
        const data = await response.json();
        const suggestions = (data.suggestions || []).map((s) => ({
            place_id: s.placePrediction.placeId,
            name: s.placePrediction.structuredFormat.mainText.text,
            address:
                s.placePrediction.structuredFormat.secondaryText?.text || "",
        }));
        res.status(200).json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/places/details", checkJwt, async (req, res) => {
    const { place_id } = req.query;
    if (!place_id)
        return res.status(400).json({ error: "place_id is required" });
    try {
        const response = await fetch(
            `${GOOGLE_PLACES_API_URL}/places/${place_id}`,
            {
                headers: {
                    "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": "id,displayName,addressComponents",
                },
            },
        );
        const data = await response.json();

        const getComponent = (types) =>
            data.addressComponents?.find(
                (c) => c.types && types.some((t) => c.types.includes(t)),
            )?.longText || "";

        const subpremise = getComponent(["subpremise"]);
        const streetNumber = getComponent(["street_number"]);
        const route = getComponent(["route"]);

        const suburb = getComponent([
            "sublocality",
            "sublocality_level_1",
            "neighborhood",
        ]);
        let city = getComponent(["locality"]);
        if (city === "Westfield") {
            city = getComponent(["administrative_area_level_1"]);
        }
        // Only include country if it's not New Zealand
        const country =
            getComponent(["country"]) === "New Zealand"
                ? ""
                : getComponent(["country"]);

        const streetAddress = [
            subpremise,
            streetNumber && route ? `${streetNumber} ${route}` : route,
        ]
            .filter(Boolean)
            .join("/");

        const parts = [streetAddress, suburb, city, country].filter(Boolean);

        res.status(200).json({
            place_id: data.id,
            name: data.displayName?.text || "",
            address: parts.join(", "),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post(
    "/friends/request",
    checkJwt,
    friendRequestRateLimit,
    async (req, res) => {
        const sender_id = req.auth.payload.sub;
        const { email } = req.body;

        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: ERRORS.invalidEmail });
        }

        try {
            // Look up receiver by email
            const token = await getMgmtToken();
            const response = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const users = await response.json();

            if (!users || users.length === 0) {
                return res.status(404).json({ error: ERRORS.userNotFound });
            }

            const receiver = users[0];
            const receiver_id = receiver.user_id;

            if (sender_id === receiver_id) {
                return res
                    .status(400)
                    .json({ error: ERRORS.friendRequestSelf });
            }

            // Check no existing request in either direction
            const { data: existing } = await supabase
                .from("friend_requests")
                .select("id, status")
                .or(
                    `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`,
                )
                .maybeSingle();

            if (existing) {
                return res
                    .status(409)
                    .json({ error: ERRORS.friendRequestExists });
            }

            // Create the request
            const { data: request, error: insertError } = await supabase
                .from("friend_requests")
                .insert({ sender_id, receiver_id, status: "pending" })
                .select()
                .single();

            if (insertError) {
                return res.status(500).json({ error: insertError.message });
            }

            // Notify the receiver
            const senderResponse = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(sender_id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const senderData = await senderResponse.json();

            await supabase.from("notifications").insert({
                user_id: receiver_id,
                type: "friend_request",
                data: {
                    request_id: request.id,
                    sender_id,
                    sender_name: senderData.name,
                    sender_picture: senderData.picture,
                },
            });

            res.status(201).json({ success: true, request_id: request.id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

app.patch("/friends/request/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const { action } = req.body; // "accept" | "decline"

    if (!["accept", "decline"].includes(action)) {
        return res
            .status(400)
            .json({ error: "Action must be accept or decline." });
    }

    try {
        const { data: request, error: fetchError } = await supabase
            .from("friend_requests")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (fetchError || !request) {
            return res
                .status(404)
                .json({ error: ERRORS.friendRequestNotFound });
        }

        if (request.receiver_id !== user_id) {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }

        if (request.status !== "pending") {
            return res
                .status(409)
                .json({ error: "Request is no longer pending." });
        }

        if (action === "decline") {
            await supabase.from("friend_requests").delete().eq("id", id);
            // Delete the notification for this request
            await supabase
                .from("notifications")
                .delete()
                .eq("type", "friend_request")
                .contains("data", { request_id: id });

            return res.status(200).json({ success: true });
        }

        // Accept: mutual shared_with update
        const sender_id = request.sender_id;

        // Fetch both users' current shared_with
        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("user_id, shared_with")
            .in("user_id", [sender_id, user_id]);

        const senderPrefs = prefs?.find((p) => p.user_id === sender_id);
        const receiverPrefs = prefs?.find((p) => p.user_id === user_id);

        // Fetch both users' Auth0 profiles for name/picture
        const token = await getMgmtToken();
        const [senderRes, receiverRes] = await Promise.all([
            fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(sender_id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            ),
            fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            ),
        ]);
        const [senderData, receiverData] = await Promise.all([
            senderRes.json(),
            receiverRes.json(),
        ]);

        const senderEntry = {
            user_id: sender_id,
            name: senderData.name,
            picture: senderData.picture,
        };
        const receiverEntry = {
            user_id,
            name: receiverData.name,
            picture: receiverData.picture,
        };

        const senderSharedWith = senderPrefs?.shared_with || [];
        const receiverSharedWith = receiverPrefs?.shared_with || [];

        // Add each other if not already present
        const senderUpdated = senderSharedWith.some(
            (u) => u.user_id === user_id,
        )
            ? senderSharedWith
            : [...senderSharedWith, receiverEntry];

        const receiverUpdated = receiverSharedWith.some(
            (u) => u.user_id === sender_id,
        )
            ? receiverSharedWith
            : [...receiverSharedWith, senderEntry];

        await Promise.all([
            supabase.from("user_preferences").upsert(
                {
                    user_id: sender_id,
                    shared_with: senderUpdated,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
            ),
            supabase.from("user_preferences").upsert(
                {
                    user_id,
                    shared_with: receiverUpdated,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
            ),
        ]);

        // Mark request as accepted
        await supabase
            .from("friend_requests")
            .update({ status: "accepted" })
            .eq("id", id);

        // Delete the friend_request notification, notify the sender of acceptance
        await supabase
            .from("notifications")
            .delete()
            .eq("type", "friend_request")
            .contains("data", { request_id: id });

        // Delete any previous friend_accepted notifications from receiver to sender
        await supabase
            .from("notifications")
            .delete()
            .eq("user_id", sender_id)
            .eq("type", "friend_accepted")
            .contains("data", { friend_id: user_id });

        // Insert fresh notification
        await supabase.from("notifications").insert([
            {
                user_id: sender_id,
                type: "friend_accepted",
                data: {
                    friend_id: user_id,
                    friend_name: receiverData.name,
                    friend_picture: receiverData.picture,
                },
            },
        ]);

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/friends/request/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    try {
        const { data: request, error: fetchError } = await supabase
            .from("friend_requests")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (fetchError || !request) {
            return res
                .status(404)
                .json({ error: ERRORS.friendRequestNotFound });
        }

        if (request.sender_id !== user_id) {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }

        if (request.status !== "pending") {
            return res
                .status(409)
                .json({ error: "Request is no longer pending." });
        }

        await supabase.from("friend_requests").delete().eq("id", id);

        // Clean up the notification on the receiver's side
        await supabase
            .from("notifications")
            .delete()
            .eq("type", "friend_request")
            .contains("data", { request_id: id });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/friends/requests/pending", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data, error } = await supabase
            .from("friend_requests")
            .select("id, receiver_id, created_at")
            .eq("sender_id", user_id)
            .eq("status", "pending");

        if (error) return res.status(500).json({ error: error.message });

        // Fetch receiver names/pictures from Auth0
        const token = await getMgmtToken();
        const enriched = await Promise.all(
            (data || []).map(async (r) => {
                try {
                    const userRes = await fetch(
                        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(r.receiver_id)}`,
                        { headers: { Authorization: `Bearer ${token}` } },
                    );
                    const user = await userRes.json();
                    return {
                        id: r.id,
                        receiver_id: r.receiver_id,
                        receiver_name: user.name,
                        receiver_picture: user.picture,
                        created_at: r.created_at,
                    };
                } catch {
                    return {
                        id: r.id,
                        receiver_id: r.receiver_id,
                        receiver_name: "Unknown",
                        receiver_picture: null,
                        created_at: r.created_at,
                    };
                }
            }),
        );

        res.status(200).json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/friends/:friendId", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { friendId } = req.params;

    try {
        // Fetch both users' current shared_with
        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("user_id, shared_with")
            .in("user_id", [user_id, friendId]);

        const myPrefs = prefs?.find((p) => p.user_id === user_id);
        const theirPrefs = prefs?.find((p) => p.user_id === friendId);

        const myUpdated = (myPrefs?.shared_with || []).filter(
            (u) => u.user_id !== friendId,
        );
        const theirUpdated = (theirPrefs?.shared_with || []).filter(
            (u) => u.user_id !== user_id,
        );

        // Update both users' shared_with
        await Promise.all([
            supabase.from("user_preferences").upsert(
                {
                    user_id,
                    shared_with: myUpdated,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
            ),
            supabase.from("user_preferences").upsert(
                {
                    user_id: friendId,
                    shared_with: theirUpdated,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
            ),
        ]);

        // Delete any friend requests between the two users in either direction
        await supabase
            .from("friend_requests")
            .delete()
            .or(
                `and(sender_id.eq.${user_id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user_id})`,
            );

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/notifications", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("read", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/notifications/read-batch", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res
            .status(400)
            .json({ error: "ids must be a non-empty array." });
    }

    try {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", ids)
            .eq("user_id", user_id); // ensure ownership

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch("/notifications/:id/read", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id)
            .eq("user_id", user_id) // ensure ownership
            .select()
            .maybeSingle();

        if (error) return res.status(500).json({ error: error.message });
        if (!data)
            return res.status(404).json({ error: ERRORS.notificationNotFound });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server running"));
