require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const supabase = require("./supabase");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
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
            if (
                typeof value !== "number" ||
                value % 0.5 !== 0 ||
                value < 1 ||
                value > 5
            ) {
                errors.push(`${name} must be a number between 1 and 5.`);
            }
        }
    }

    const missingName = !restaurant_name;
    const missingText = !review_text;
    const missingRatings = !food_rating && !drink_rating && !ambience_rating;
    if (missingName || (missingText && missingRatings)) {
        errors.push(
            "Restaurant name and either a review text or all three ratings are required.",
        );
    }

    return errors;
};

app.get("/public", (req, res) => {
    res.json({ message: "This is a public endpoint accessible to everyone." });
});

app.get("/private", checkJwt, (req, res) => {
    res.json({ message: "You are authorised!" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

app.get("/test-db", checkJwt, async (req, res) => {
    const { data, error } = await supabase.from("reviews").select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ data });
});

app.post("/reviews", checkJwt, async (req, res) => {
    const errors = validateReview(req.body);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const {
        restaurant_name,
        review_text,
        food_rating,
        drink_rating,
        ambience_rating,
    } = req.body;
    const user_id = req.auth.payload.sub;

    const { data, error } = await supabase
        .from("reviews")
        .insert([
            {
                user_id,
                restaurant_name,
                review_text,
                food_rating,
                drink_rating,
                ambience_rating,
            },
        ])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ data });
});

app.get("/reviews", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;

    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
});
