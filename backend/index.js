require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const supabase = require("./supabase");
const multer = require("multer");

// Config
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://mimu-reviews.vercel.app",
];
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
const MAX_REVIEW_TEXT_LENGTH = 10000;
const RATING_MIN = 0.5;
const RATING_MAX = 5;
const DEFAULT_FOOD_EMOJI = "🍽️";
const DEFAULT_DRINK_EMOJI = "☕️";
const DEFAULT_AMBIENCE_EMOJI = "✨";

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

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

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

    return urlData.publicUrl;
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
    mgmtToken = data.access_token;
    // Cache for 23 hours (token lasts 24)
    mgmtTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return mgmtToken;
};

// Routes
app.get("/reviews", checkJwt, async (req, res) => {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("visit_date", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

app.get("/reviews/public", async (req, res) => {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_public", true)
        .order("visit_date", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
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
            review_text,
            food_rating,
            drink_rating,
            ambience_rating,
            reviewer_name,
            reviewer_picture,
            visit_date,
            is_public,
            food_emoji,
            drink_emoji,
            ambience_emoji,
        } = req.body;
        const user_id = req.auth.payload.sub;

        try {
            const image_urls = await Promise.all(
                (req.files || []).map((file) => uploadImage(file, user_id)),
            );

            const { data, error } = await supabase
                .from("reviews")
                .insert([
                    {
                        user_id,
                        restaurant_name: restaurant_name.trim(),
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
                        image_urls,
                        food_emoji: food_emoji || DEFAULT_FOOD_EMOJI,
                        drink_emoji: drink_emoji || DEFAULT_DRINK_EMOJI,
                        ambience_emoji:
                            ambience_emoji || DEFAULT_AMBIENCE_EMOJI,
                    },
                ])
                .select();

            if (error) return res.status(500).json({ error: error.message });
            res.status(201).json(data[0]);
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

        if (req.body.restaurant_name !== undefined) {
            const name = req.body.restaurant_name.trim();
            if (!name || name.length > MAX_RESTAURANT_NAME_LENGTH) {
                return res
                    .status(400)
                    .json({ error: ERRORS.invalidRestaurantName });
            }
            updates.restaurant_name = name;
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

        for (const field of ["food_emoji", "drink_emoji", "ambience_emoji"]) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        try {
            if (req.body.image_urls !== undefined) {
                const updatedUrls = JSON.parse(req.body.image_urls);
                const removedUrls = (review.image_urls || []).filter(
                    (url) => !updatedUrls.includes(url),
                );
                await deleteImages(removedUrls);
                updates.image_urls = updatedUrls;
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
                const newUrls = await Promise.all(
                    req.files.map((file) => uploadImage(file, user_id)),
                );
                updates.image_urls = [...existingUrls, ...newUrls];
            }

            const { data, error } = await supabase
                .from("reviews")
                .update(updates)
                .eq("id", id)
                .select();

            if (error) return res.status(500).json({ error: error.message });
            res.status(200).json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

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
            const publicUrl = await uploadImage(
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

app.get("/user/picture", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const token = await getMgmtToken();
        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        const userData = await userResponse.json();
        res.status(200).json({ picture: userData.picture });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
