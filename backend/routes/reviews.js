const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { checkJwt, upload } = require("../middleware");
const {
    ERRORS,
    MAX_IMAGES_PER_REVIEW,
    MAX_RESTAURANT_NAME_LENGTH,
    RATING_MIN,
    RATING_MAX,
} = require("../constants");
const {
    getMgmtToken,
    uploadImage,
    deleteImages,
    attachContributions,
    validateReview,
} = require("../helpers");

router.get("/", checkJwt, async (req, res) => {
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

router.get("/public", async (req, res) => {
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

router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const decodedUserId = decodeURIComponent(userId);

        let viewerId = null;
        try {
            await new Promise((resolve, reject) => {
                checkJwt(req, res, (err) => (err ? reject(err) : resolve()));
            });
            viewerId = req.auth.payload.sub;
        } catch {
            // unauthenticated - viewerId stays null
        }

        let isFriend = false;
        if (viewerId && viewerId !== decodedUserId) {
            const { data: prefs } = await supabase
                .from("user_preferences")
                .select("shared_with")
                .eq("user_id", decodedUserId)
                .maybeSingle();

            const sharedWith = prefs?.shared_with || [];
            isFriend = sharedWith.some((u) => u.user_id === viewerId);
        }

        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .or(
                `user_id.eq.${decodedUserId},allowed_contributors.cs.${JSON.stringify([{ user_id: decodedUserId }])}`,
            )
            .order("visit_date", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const visibleReviews = data.filter((r) => {
            if (r.is_public) return true;
            if (isFriend) return true;
            return false;
        });

        const reviews = await attachContributions(visibleReviews);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data)
            return res.status(404).json({ error: "Review not found" });

        if (!data.is_public) {
            try {
                await new Promise((resolve, reject) => {
                    checkJwt(req, res, (err) =>
                        err ? reject(err) : resolve(),
                    );
                });
                const userId = req.auth.payload.sub;

                const isOwner = data.user_id === userId;
                const isContributor = (data.allowed_contributors || []).some(
                    (c) => c.user_id === userId,
                );

                if (!isOwner && !isContributor) {
                    const { data: prefs } = await supabase
                        .from("user_preferences")
                        .select("shared_with")
                        .eq("user_id", data.user_id)
                        .single();

                    const sharedWith = prefs?.shared_with || [];
                    if (!sharedWith.some((u) => u.user_id === userId)) {
                        return res.status(403).json({ private: true });
                    }
                }
            } catch {
                return res.status(403).json({ private: true });
            }
        }

        const [review] = await attachContributions([data]);
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post(
    "/",
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

            const parsedContributors = allowed_contributors
                ? JSON.parse(allowed_contributors)
                : [];
            if (
                (is_collaborative === "true" || is_collaborative === true) &&
                parsedContributors.length > 0
            ) {
                const token = await getMgmtToken();
                const adderRes = await fetch(
                    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const adderData = await adderRes.json();

                await Promise.all(
                    parsedContributors.map(async (c) => {
                        const { error: notifError } = await supabase
                            .from("notifications")
                            .insert({
                                user_id: c.user_id,
                                type: "review_contributor_added",
                                data: {
                                    review_id: data[0].id,
                                    restaurant_name: restaurant_name.trim(),
                                    adder_id: user_id,
                                    adder_name: adderData.name,
                                    adder_picture: adderData.picture,
                                },
                            });
                        if (notifError)
                            console.error(
                                "Notification insert error:",
                                notifError,
                            );
                    }),
                );
            }

            res.status(201).json({ ...data[0], contributions: [] });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

router.patch(
    "/:id",
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

            if (updates.allowed_contributors) {
                const previousContributors = review.allowed_contributors || [];
                const newContributors = updates.allowed_contributors.filter(
                    (c) =>
                        !previousContributors.some(
                            (p) => p.user_id === c.user_id,
                        ),
                );

                if (newContributors.length > 0) {
                    const token = await getMgmtToken();
                    const adderRes = await fetch(
                        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                        { headers: { Authorization: `Bearer ${token}` } },
                    );
                    const adderData = await adderRes.json();

                    await Promise.all(
                        newContributors.map((c) =>
                            supabase.from("notifications").insert({
                                user_id: c.user_id,
                                type: "review_contributor_added",
                                data: {
                                    review_id: review.id,
                                    restaurant_name: review.restaurant_name,
                                    adder_id: user_id,
                                    adder_name: adderData.name,
                                    adder_picture: adderData.picture,
                                },
                            }),
                        ),
                    );
                }
            }

            const [reviewWithContributions] = await attachContributions(data);
            res.status(200).json(reviewWithContributions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

router.post("/:id/contributions", checkJwt, async (req, res) => {
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

router.delete("/:id", checkJwt, async (req, res) => {
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

        await supabase
            .from("notifications")
            .delete()
            .eq("type", "review_contributor_added")
            .contains("data", { review_id: id });

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

router.delete("/:id/contributions", checkJwt, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.payload.sub;

    const { data: review, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !review)
        return res.status(404).json({ error: ERRORS.reviewNotFound });

    if (review.user_id === user_id)
        return res.status(403).json({ error: ERRORS.unauthorised });

    const isAllowed = (review.allowed_contributors || []).some(
        (c) => c.user_id === user_id,
    );
    if (!isAllowed) return res.status(403).json({ error: ERRORS.unauthorised });

    try {
        const { error: deleteError } = await supabase
            .from("review_contributions")
            .delete()
            .eq("review_id", id)
            .eq("user_id", user_id);

        if (deleteError)
            return res.status(500).json({ error: deleteError.message });

        const updatedContributors = (review.allowed_contributors || []).filter(
            (c) => c.user_id !== user_id,
        );
        const { error: updateError } = await supabase
            .from("reviews")
            .update({ allowed_contributors: updatedContributors })
            .eq("id", id);

        if (updateError)
            return res.status(500).json({ error: updateError.message });

        await supabase
            .from("notifications")
            .delete()
            .eq("type", "review_contributor_added")
            .eq("user_id", user_id)
            .contains("data", { review_id: id });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
