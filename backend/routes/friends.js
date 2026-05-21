const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { checkJwt, friendRequestRateLimit } = require("../middleware");
const { ERRORS, EMAIL_REGEX } = require("../constants");
const { getMgmtToken } = require("../helpers");

router.post("/request", checkJwt, friendRequestRateLimit, async (req, res) => {
    const sender_id = req.auth.payload.sub;
    const { email, user_id: receiverUserId } = req.body;

    if (!email && !receiverUserId) {
        return res.status(400).json({ error: ERRORS.invalidUserRequest });
    }

    if (email && !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: ERRORS.invalidUserRequest });
    }

    try {
        const token = await getMgmtToken();
        let receiver_id;

        if (receiverUserId) {
            const response = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(receiverUserId)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const userData = await response.json();
            if (!userData || userData.error) {
                return res.status(404).json({ error: ERRORS.userNotFound });
            }
            receiver_id = userData.user_id;
        } else {
            const response = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const users = await response.json();
            if (!users || users.length === 0) {
                return res.status(404).json({ error: ERRORS.userNotFound });
            }
            receiver_id = users[0].user_id;
        }

        if (sender_id === receiver_id) {
            return res.status(400).json({ error: ERRORS.friendRequestSelf });
        }

        const { data: existing } = await supabase
            .from("friend_requests")
            .select("id, status")
            .or(
                `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`,
            )
            .maybeSingle();

        if (existing) {
            return res.status(409).json({ error: ERRORS.friendRequestExists });
        }

        const { data: request, error: insertError } = await supabase
            .from("friend_requests")
            .insert({ sender_id, receiver_id, status: "pending" })
            .select()
            .single();

        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

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
});

router.patch("/request/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const { action } = req.body;

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
            await supabase
                .from("notifications")
                .delete()
                .eq("type", "friend_request")
                .contains("data", { request_id: id });

            return res.status(200).json({ success: true });
        }

        const sender_id = request.sender_id;

        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("user_id, shared_with")
            .in("user_id", [sender_id, user_id]);

        const senderPrefs = prefs?.find((p) => p.user_id === sender_id);
        const receiverPrefs = prefs?.find((p) => p.user_id === user_id);

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

        await supabase
            .from("friend_requests")
            .update({ status: "accepted" })
            .eq("id", id);

        await supabase
            .from("notifications")
            .delete()
            .eq("type", "friend_request")
            .contains("data", { request_id: id });

        await supabase
            .from("notifications")
            .delete()
            .eq("user_id", sender_id)
            .eq("type", "friend_accepted")
            .contains("data", { friend_id: user_id });

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

router.get("/requests/pending", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data, error } = await supabase
            .from("friend_requests")
            .select("id, receiver_id, created_at")
            .eq("sender_id", user_id)
            .eq("status", "pending");

        if (error) return res.status(500).json({ error: error.message });

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

router.delete("/request/:id", checkJwt, async (req, res) => {
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

router.delete("/:friendId", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { friendId } = req.params;

    try {
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

module.exports = router;
