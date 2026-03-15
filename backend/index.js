require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const supabase = require("./supabase");

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "image/gif",
            "image/avif",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, WebP and HEIC images are allowed"));
        }
    },
});

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "https://mimu-reviews.vercel.app"],
    }),
);
app.use(express.json());

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

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
        errors.push("Restaurant name is required.");
    } else if (
        typeof restaurant_name !== "string" ||
        restaurant_name.trim().length === 0
    ) {
        errors.push("Restaurant name must be a non-empty string.");
    }

    if (review_text && typeof review_text !== "string") {
        errors.push("Review text must be a string.");
    } else if (review_text && review_text.trim().length > 10000) {
        errors.push("Review text must be less than 10,000 characters.");
    }

    const ratings = { food_rating, drink_rating, ambience_rating };
    for (const [name, value] of Object.entries(ratings)) {
        if (value !== null && value !== undefined && value !== "") {
            const parsed = parseFloat(value);
            if (isNaN(parsed) || parsed < 0.5 || parsed > 5) {
                errors.push(`${name} must be a number between 0.5 and 5.`);
            }
        }
    }

    const missingRestaurantName = !restaurant_name;
    const missingText = !review_text;
    const missingRatings = !food_rating && !drink_rating && !ambience_rating;
    if (missingRestaurantName || (missingText && missingRatings)) {
        errors.push(
            "Restaurant name and either a review text or all three ratings are required.",
        );
    }

    return errors;
};

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

app.post(
    "/reviews",
    checkJwt,
    (req, res, next) => {
        upload.array("images", 5)(req, res, (err) => {
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
        } = req.body;
        const user_id = req.auth.payload.sub;

        const image_urls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const sanitizedUserId = user_id.replace("|", "-");
                const sanitizedFilename = file.originalname.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_",
                );
                const filename = `${sanitizedUserId}/${Date.now()}-${sanitizedFilename}`;
                const { data, error } = await supabase.storage
                    .from("review-images")
                    .upload(filename, file.buffer, {
                        contentType: file.mimetype,
                    });

                if (error)
                    return res.status(500).json({ error: error.message });

                const { data: urlData } = supabase.storage
                    .from("review-images")
                    .getPublicUrl(data.path);

                image_urls.push(urlData.publicUrl);
            }
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert([
                {
                    user_id,
                    restaurant_name: restaurant_name.trim(),
                    review_text: review_text ? review_text.trim() : null,
                    food_rating: food_rating ? parseFloat(food_rating) : null,
                    drink_rating: drink_rating
                        ? parseFloat(drink_rating)
                        : null,
                    ambience_rating: ambience_rating
                        ? parseFloat(ambience_rating)
                        : null,
                    reviewer_name: reviewer_name || null,
                    reviewer_picture: reviewer_picture || null,
                    visit_date:
                        visit_date || new Date().toISOString().split("T")[0],
                    is_public: is_public === "true",
                    image_urls,
                },
            ])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data[0]);
    },
);

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

app.delete("/reviews/:id", checkJwt, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.payload.sub;

    // Fetch the review first to verify ownership and get image URLs
    const { data: review, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !review) {
        return res.status(404).json({ error: "Review not found" });
    }

    if (review.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorised" });
    }

    // Delete images from Supabase Storage
    if (review.image_urls && review.image_urls.length > 0) {
        const sanitizedUserId = user_id.replace("|", "-");
        const paths = review.image_urls.map((url) => {
            const filename = decodeURIComponent(url.split("/").pop());
            return `${sanitizedUserId}/${filename}`;
        });

        const { error: storageError } = await supabase.storage
            .from("review-images")
            .remove(paths);

        if (storageError) {
            return res.status(500).json({ error: storageError.message });
        }
    }

    // Delete the review
    const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
    }

    res.status(200).json({ success: true });
});
