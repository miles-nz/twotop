const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { checkJwt, upload } = require("../middleware");
const {
    ERRORS,
    EMAIL_REGEX,
    MAX_USER_NAME_LENGTH,
    PROFILE_PICTURE_BUCKET,
} = require("../constants");
const { getMgmtToken, uploadImage } = require("../helpers");

router.get("/", checkJwt, async (req, res) => {
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

router.get("/me", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const token = await getMgmtToken();
        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const userData = await userResponse.json();

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

router.get("/preferences", checkJwt, async (req, res) => {
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

router.get("/:id", async (req, res) => {
    const id = decodeURIComponent(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "id is required" });
    }

    try {
        const token = await getMgmtToken();
        const [userRes, countRes, featuredRes] = await Promise.all([
            fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            ),
            supabase
                .from("reviews")
                .select("is_public")
                .or(
                    `user_id.eq.${id},allowed_contributors.cs.${JSON.stringify([{ user_id: id }])}`,
                ),
            supabase
                .from("lists")
                .select("id", { count: "exact" })
                .eq("user_id", id)
                .eq("is_featured", true),
        ]);

        const data = await userRes.json();

        if (!data || data.error) {
            return res.status(404).json({ error: ERRORS.userNotFound });
        }

        const allReviews = countRes.data ?? [];
        const totalCount = allReviews.length;
        const publicCount = allReviews.filter((r) => r.is_public).length;

        res.status(200).json({
            user_id: data.user_id,
            name: data.name,
            picture: data.picture,
            created_at: data.created_at,
            public_review_count: publicCount,
            total_review_count: totalCount,
            featured_list_count: featuredRes.count ?? 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch(
    "/picture",
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

            const userResponse = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const userData = await userResponse.json();
            const oldPictureUrl = userData.picture;

            const { url: publicUrl } = await uploadImage(
                req.file,
                user_id,
                PROFILE_PICTURE_BUCKET,
            );

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

            const { error: reviewsError } = await supabase
                .from("reviews")
                .update({ reviewer_picture: publicUrl })
                .eq("user_id", user_id);

            if (reviewsError)
                console.error(
                    "Failed to update reviewer pictures:",
                    reviewsError.message,
                );

            const { error: contributionsError } = await supabase
                .from("review_contributions")
                .update({ reviewer_picture: publicUrl })
                .eq("user_id", user_id);

            if (contributionsError)
                console.error(
                    "Failed to update contribution pictures:",
                    contributionsError.message,
                );

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

router.patch("/name", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: ERRORS.userNameRequired });
    }

    if (name.trim().length > MAX_USER_NAME_LENGTH) {
        return res.status(400).json({ error: ERRORS.userNameTooLong });
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

router.patch("/preferences", checkJwt, async (req, res) => {
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

router.delete("/picture", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const token = await getMgmtToken();

        const userResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const userData = await userResponse.json();
        const oldPictureUrl = userData.picture;

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

        if (oldPictureUrl && oldPictureUrl.includes(PROFILE_PICTURE_BUCKET)) {
            const oldPath = decodeURIComponent(
                oldPictureUrl.split(`/${PROFILE_PICTURE_BUCKET}/`)[1],
            );
            await supabase.storage
                .from(PROFILE_PICTURE_BUCKET)
                .remove([oldPath]);
        }

        await supabase
            .from("reviews")
            .update({ reviewer_picture: null })
            .eq("user_id", user_id);

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

module.exports = router;
