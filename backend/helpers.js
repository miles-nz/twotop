require("dotenv").config();
const supabase = require("./supabase");
const sharp = require("sharp");
const {
    REVIEW_IMAGE_BUCKET,
    MAX_RESTAURANT_NAME_LENGTH,
    MAX_REVIEW_TEXT_LENGTH,
    RATING_MIN,
    RATING_MAX,
    ERRORS,
} = require("./constants");

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
    mgmtTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return mgmtToken;
};

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

const notifyListUpdated = async (listId, editorUserId, ownerUserId) => {
    try {
        const COOLDOWN_MINUTES = 10;
        const now = new Date();

        const { data: existing } = await supabase
            .from("list_edit_notifications")
            .select("last_notified_at")
            .eq("list_id", listId)
            .eq("editor_user_id", editorUserId)
            .maybeSingle();

        const lastNotified = existing?.last_notified_at
            ? new Date(existing.last_notified_at)
            : null;

        const withinCooldown =
            lastNotified && (now - lastNotified) / 1000 / 60 < COOLDOWN_MINUTES;

        if (withinCooldown) return;

        const token = await getMgmtToken();
        const [editorRes, listResult, sharesResult] = await Promise.all([
            fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(editorUserId)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            ),
            supabase
                .from("lists")
                .select("name")
                .eq("id", listId)
                .maybeSingle(),
            supabase
                .from("list_shares")
                .select("user_id")
                .eq("list_id", listId),
        ]);

        const editorData = await editorRes.json();
        const list = listResult.data;
        const sharedUsers = sharesResult.data || [];

        const recipientIds = [
            ownerUserId,
            ...sharedUsers.map((s) => s.user_id),
        ].filter((id) => id !== editorUserId);

        if (recipientIds.length === 0) return;

        const notificationData = {
            list_id: listId,
            list_name: list?.name || "a list",
            editor_id: editorUserId,
            editor_name: editorData.name,
            editor_picture: editorData.picture,
        };

        await supabase
            .from("notifications")
            .delete()
            .eq("type", "list_updated")
            .in("user_id", recipientIds)
            .contains("data", { list_id: listId, editor_id: editorUserId });

        await supabase.from("notifications").insert(
            recipientIds.map((userId) => ({
                user_id: userId,
                type: "list_updated",
                data: notificationData,
            })),
        );

        await supabase.from("list_edit_notifications").upsert(
            {
                list_id: listId,
                editor_user_id: editorUserId,
                last_notified_at: now.toISOString(),
            },
            { onConflict: "list_id,editor_user_id" },
        );
    } catch (err) {
        console.error("Failed to send list update notification:", err);
    }
};

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

module.exports = {
    getMgmtToken,
    uploadImage,
    deleteImages,
    attachContributions,
    notifyListUpdated,
    validateReview,
};
