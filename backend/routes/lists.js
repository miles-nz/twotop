const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { checkJwt } = require("../middleware");
const { ERRORS } = require("../constants");
const { getMgmtToken, notifyListUpdated } = require("../helpers");

router.get("/", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    try {
        const { data: ownLists, error: ownError } = await supabase
            .from("lists")
            .select("*, share_token")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (ownError) return res.status(500).json({ error: ownError.message });

        const { data: shares, error: sharesError } = await supabase
            .from("list_shares")
            .select("list_id, permission")
            .eq("user_id", user_id);

        if (sharesError)
            return res.status(500).json({ error: sharesError.message });

        let sharedLists = [];
        if (shares && shares.length > 0) {
            const sharedListIds = shares.map((s) => s.list_id);
            const { data: fetchedSharedLists, error: sharedError } =
                await supabase
                    .from("lists")
                    .select("*")
                    .in("id", sharedListIds)
                    .order("created_at", { ascending: false });

            if (sharedError)
                return res.status(500).json({ error: sharedError.message });

            sharedLists = (fetchedSharedLists || []).map((list) => ({
                ...list,
                permission:
                    shares.find((s) => s.list_id === list.id)?.permission ||
                    "view",
            }));
        }

        const allLists = [
            ...(ownLists || []).map((l) => ({ ...l, permission: "owner" })),
            ...sharedLists,
        ];

        if (allLists.length === 0) return res.status(200).json([]);

        const listIds = allLists.map((l) => l.id);

        const { data: restaurants } = await supabase
            .from("list_restaurants")
            .select("list_id, checked")
            .in("list_id", listIds);

        const { data: listShares } = await supabase
            .from("list_shares")
            .select("*")
            .in("list_id", listIds);

        const userIdsToFetch = new Set();
        sharedLists.forEach((l) => userIdsToFetch.add(l.user_id));
        (listShares || []).forEach((s) => userIdsToFetch.add(s.user_id));

        const token = await getMgmtToken();
        const profileMap = {};
        await Promise.all(
            [...userIdsToFetch].map(async (uid) => {
                try {
                    const res = await fetch(
                        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(uid)}`,
                        { headers: { Authorization: `Bearer ${token}` } },
                    );
                    const data = await res.json();
                    profileMap[uid] = {
                        name: data.name,
                        picture: data.picture,
                    };
                } catch {
                    profileMap[uid] = { name: null, picture: null };
                }
            }),
        );

        sharedLists = sharedLists.map((list) => ({
            ...list,
            owner_name: profileMap[list.user_id]?.name || null,
            owner_picture: profileMap[list.user_id]?.picture || null,
        }));

        const enrichedShares = (listShares || []).map((share) => ({
            ...share,
            name: profileMap[share.user_id]?.name || null,
            picture: profileMap[share.user_id]?.picture || null,
        }));

        const restaurantsByList = (restaurants || []).reduce((acc, r) => {
            if (!acc[r.list_id]) acc[r.list_id] = { total: 0, checked: 0 };
            acc[r.list_id].total += 1;
            if (r.checked) acc[r.list_id].checked += 1;
            return acc;
        }, {});

        const sharesByList = enrichedShares.reduce((acc, s) => {
            if (!acc[s.list_id]) acc[s.list_id] = [];
            acc[s.list_id].push(s);
            return acc;
        }, {});

        const enrichedAllLists = [
            ...(ownLists || []).map((l) => ({ ...l, permission: "owner" })),
            ...sharedLists,
        ];

        const result = enrichedAllLists.map((l) => ({
            ...l,
            restaurant_count: restaurantsByList[l.id]?.total ?? 0,
            checked_count: restaurantsByList[l.id]?.checked ?? 0,
            shares: sharesByList[l.id] || [],
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/user/:userId", async (req, res) => {
    const userId = decodeURIComponent(req.params.userId);

    try {
        const { data: lists, error } = await supabase
            .from("lists")
            .select("*, list_restaurants(*)")
            .eq("user_id", userId)
            .eq("is_featured", true)
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const allPlaceIds = [
            ...new Set(
                (lists || [])
                    .flatMap((l) => l.list_restaurants || [])
                    .filter((r) => r.place_id)
                    .map((r) => r.place_id),
            ),
        ];

        let ratingsMap = {};
        if (allPlaceIds.length > 0) {
            const { data: reviews } = await supabase
                .from("reviews")
                .select("place_id, food_rating, drink_rating, ambience_rating")
                .eq("user_id", userId)
                .in("place_id", allPlaceIds)
                .order("visit_date", { ascending: false });

            for (const review of reviews || []) {
                if (!ratingsMap[review.place_id]) {
                    ratingsMap[review.place_id] = {
                        food: review.food_rating,
                        drink: review.drink_rating,
                        ambience: review.ambience_rating,
                    };
                }
            }
        }

        const result = (lists || []).map((list) => ({
            id: list.id,
            name: list.name,
            description: list.description,
            is_checklist: list.is_checklist,
            is_featured: list.is_featured,
            share_token: list.share_token,
            created_at: list.created_at,
            restaurants: (list.list_restaurants || []).sort(
                (a, b) => a.position - b.position,
            ),
            ratings: ratingsMap,
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/shared/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { data: list, error } = await supabase
            .from("lists")
            .select("*, list_restaurants(*)")
            .eq("share_token", token)
            .maybeSingle();

        if (error || !list)
            return res.status(404).json({ error: "List not found." });

        const restaurants = (list.list_restaurants || []).sort(
            (a, b) => a.position - b.position,
        );

        const placeIds = restaurants
            .filter((r) => r.place_id)
            .map((r) => r.place_id);

        let ratingsMap = {};
        if (placeIds.length > 0) {
            const { data: reviews } = await supabase
                .from("reviews")
                .select("place_id, food_rating, drink_rating, ambience_rating")
                .eq("user_id", list.user_id)
                .in("place_id", placeIds)
                .order("visit_date", { ascending: false });

            for (const review of reviews || []) {
                if (!ratingsMap[review.place_id]) {
                    ratingsMap[review.place_id] = {
                        food: review.food_rating,
                        drink: review.drink_rating,
                        ambience: review.ambience_rating,
                    };
                }
            }
        }

        const mgmtToken = await getMgmtToken();
        const ownerRes = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(list.user_id)}`,
            { headers: { Authorization: `Bearer ${mgmtToken}` } },
        );
        const ownerData = await ownerRes.json();

        res.status(200).json({
            id: list.id,
            name: list.name,
            description: list.description,
            is_checklist: list.is_checklist,
            restaurants,
            ratings: ratingsMap,
            show_ratings: list.show_ratings,
            owner_name: ownerData.name,
            owner_picture: ownerData.picture,
            owner_user_id: list.user_id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    try {
        const token = await getMgmtToken();

        const { data: list, error: listError } = await supabase
            .from("lists")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (listError || !list)
            return res.status(404).json({ error: "List not found." });

        const isOwner = list.user_id === user_id;
        let permission = null;

        if (isOwner) {
            permission = "owner";
        } else {
            const { data: share } = await supabase
                .from("list_shares")
                .select("permission")
                .eq("list_id", id)
                .eq("user_id", user_id)
                .maybeSingle();

            if (!share)
                return res.status(403).json({ error: ERRORS.unauthorised });

            permission = share.permission;
        }

        const [restaurantsRes, sharesRes] = await Promise.all([
            supabase
                .from("list_restaurants")
                .select("*")
                .eq("list_id", id)
                .order("position", { ascending: true }),
            supabase.from("list_shares").select("*").eq("list_id", id),
        ]);

        const restaurants = restaurantsRes.data || [];
        const listShares = sharesRes.data || [];

        const placeIds = restaurants
            .filter((r) => r.place_id)
            .map((r) => r.place_id);

        let ratingsMap = {};
        if (placeIds.length > 0) {
            const { data: reviews } = await supabase
                .from("reviews")
                .select("place_id, food_rating, drink_rating, ambience_rating")
                .eq("user_id", list.user_id)
                .in("place_id", placeIds)
                .order("visit_date", { ascending: false });

            for (const review of reviews || []) {
                if (!ratingsMap[review.place_id]) {
                    ratingsMap[review.place_id] = {
                        food: review.food_rating,
                        drink: review.drink_rating,
                        ambience: review.ambience_rating,
                    };
                }
            }
        }

        const userIdsToFetch = new Set([
            ...listShares.map((s) => s.user_id),
            ...(!isOwner ? [list.user_id] : []),
        ]);

        const profileMap = {};
        await Promise.all(
            [...userIdsToFetch].map(async (uid) => {
                try {
                    const res = await fetch(
                        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(uid)}`,
                        { headers: { Authorization: `Bearer ${token}` } },
                    );
                    const data = await res.json();
                    profileMap[uid] = {
                        name: data.name,
                        picture: data.picture,
                    };
                } catch {
                    profileMap[uid] = { name: null, picture: null };
                }
            }),
        );

        const enrichedShares = listShares.map((share) => ({
            ...share,
            name: profileMap[share.user_id]?.name || null,
            picture: profileMap[share.user_id]?.picture || null,
        }));

        res.status(200).json({
            ...list,
            permission,
            restaurants,
            ratings: ratingsMap,
            shares: enrichedShares,
            ...(!isOwner && {
                owner_name: profileMap[list.user_id]?.name || null,
                owner_picture: profileMap[list.user_id]?.picture || null,
            }),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { name, description, is_checklist } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "List name is required." });
    }
    if (name.trim().length > 100) {
        return res
            .status(400)
            .json({ error: "List name must be 100 characters or less." });
    }

    try {
        const { data, error } = await supabase
            .from("lists")
            .insert({
                user_id,
                name: name.trim(),
                description: description?.trim() || null,
                is_checklist: is_checklist === true,
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({
            ...data,
            restaurant_count: 0,
            checked_count: 0,
            restaurants: [],
            shares: [],
            permission: "owner",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:id/restaurants", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const { place_id, restaurant_name, restaurant_address } = req.body;

    if (!restaurant_name || restaurant_name.trim().length === 0) {
        return res.status(400).json({ error: "Restaurant name is required." });
    }

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }
    }

    try {
        const { data: existing } = await supabase
            .from("list_restaurants")
            .select("id, position")
            .eq("list_id", id);

        if (existing && existing.length > 0) {
            await Promise.all(
                existing.map((r) =>
                    supabase
                        .from("list_restaurants")
                        .update({ position: r.position + 1 })
                        .eq("id", r.id),
                ),
            );
        }

        const { data, error } = await supabase
            .from("list_restaurants")
            .insert({
                list_id: id,
                place_id: place_id || null,
                restaurant_name: restaurant_name.trim(),
                restaurant_address: restaurant_address?.trim() || null,
                added_by: user_id,
                position: 0,
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        await notifyListUpdated(id, user_id, list.user_id);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:id/share", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const { user_id: receiverId, permission } = req.body;

    if (!receiverId) {
        return res.status(400).json({ error: "user_id is required." });
    }

    if (!["view", "edit"].includes(permission)) {
        return res
            .status(400)
            .json({ error: "Permission must be view or edit." });
    }

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;

    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }

        if (permission === "edit") {
            return res
                .status(403)
                .json({ error: "Only the list owner can grant edit access." });
        }
    }

    if (receiverId === user_id) {
        return res
            .status(400)
            .json({ error: "You cannot share a list with yourself." });
    }

    const { data: existing } = await supabase
        .from("list_shares")
        .select("id")
        .eq("list_id", id)
        .eq("user_id", receiverId)
        .maybeSingle();

    if (existing) {
        return res
            .status(409)
            .json({ error: "This list is already shared with that user." });
    }

    try {
        const token = await getMgmtToken();

        const sharerResponse = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const sharerData = await sharerResponse.json();

        await supabase.from("notifications").insert({
            user_id: receiverId,
            type: "list_shared",
            data: {
                list_id: id,
                list_name: list.name,
                sharer_id: user_id,
                sharer_name: sharerData.name,
                sharer_picture: sharerData.picture,
                permission,
            },
        });

        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/share/:notificationId/accept", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { notificationId } = req.params;

    const { data: notification, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .eq("user_id", user_id)
        .maybeSingle();

    if (fetchError || !notification) {
        return res.status(404).json({ error: ERRORS.notificationNotFound });
    }

    if (notification.type !== "list_shared") {
        return res.status(400).json({ error: "Invalid notification type." });
    }

    const { list_id, permission, sharer_id, list_name } = notification.data;

    try {
        const { error: shareError } = await supabase
            .from("list_shares")
            .insert({ list_id, user_id, permission });

        if (shareError)
            return res.status(500).json({ error: shareError.message });

        await supabase.from("notifications").delete().eq("id", notificationId);

        const token = await getMgmtToken();
        const acceptorRes = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        const acceptorData = await acceptorRes.json();

        await supabase.from("notifications").insert({
            user_id: sharer_id,
            type: "list_share_accepted",
            data: {
                list_id,
                list_name,
                acceptor_id: user_id,
                acceptor_name: acceptorData.name,
                acceptor_picture: acceptorData.picture,
            },
        });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/share/:notificationId/decline", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { notificationId } = req.params;

    const { data: notification, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .eq("user_id", user_id)
        .maybeSingle();

    if (fetchError || !notification) {
        return res.status(404).json({ error: ERRORS.notificationNotFound });
    }

    if (notification.type !== "list_shared") {
        return res.status(400).json({ error: "Invalid notification type." });
    }

    try {
        await supabase.from("notifications").delete().eq("id", notificationId);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/restaurants/sort-checked", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }
    }

    try {
        const { data: restaurants, error } = await supabase
            .from("list_restaurants")
            .select("id, position, checked")
            .eq("list_id", id)
            .order("position", { ascending: true });

        if (error) return res.status(500).json({ error: error.message });

        const unchecked = restaurants.filter((r) => !r.checked);
        const checked = restaurants.filter((r) => r.checked);
        const sorted = [...unchecked, ...checked];

        await Promise.all(
            sorted.map((r, i) =>
                supabase
                    .from("list_restaurants")
                    .update({ position: i })
                    .eq("id", r.id),
            ),
        );

        await notifyListUpdated(id, user_id, list.user_id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/restaurants/reorder", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
        return res
            .status(400)
            .json({ error: "Order must be a non-empty array." });
    }

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }
    }

    try {
        await Promise.all(
            order.map(({ id: restaurantId, position }) =>
                supabase
                    .from("list_restaurants")
                    .update({ position })
                    .eq("id", restaurantId)
                    .eq("list_id", id),
            ),
        );

        await notifyListUpdated(id, user_id, list.user_id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/restaurants/:restaurantId", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id, restaurantId } = req.params;
    const { restaurant_address } = req.body;

    if (
        restaurant_address !== undefined &&
        typeof restaurant_address !== "string"
    ) {
        return res.status(400).json({ error: "Invalid restaurant_address" });
    }

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }
    }

    try {
        const { data, error } = await supabase
            .from("list_restaurants")
            .update({
                restaurant_address: restaurant_address?.trim() || null,
            })
            .eq("id", restaurantId)
            .eq("list_id", id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch(
    "/:id/restaurants/:restaurantId/check",
    checkJwt,
    async (req, res) => {
        const user_id = req.auth.payload.sub;
        const { id, restaurantId } = req.params;
        const { checked } = req.body;

        if (typeof checked !== "boolean") {
            return res
                .status(400)
                .json({ error: "checked must be a boolean." });
        }

        const { data: list, error: fetchError } = await supabase
            .from("lists")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (fetchError || !list)
            return res.status(404).json({ error: "List not found." });

        const isOwner = list.user_id === user_id;
        if (!isOwner) {
            const { data: share } = await supabase
                .from("list_shares")
                .select("permission")
                .eq("list_id", id)
                .eq("user_id", user_id)
                .maybeSingle();

            if (!share || share.permission !== "edit") {
                return res.status(403).json({ error: ERRORS.unauthorised });
            }
        }

        try {
            const { data, error } = await supabase
                .from("list_restaurants")
                .update({ checked })
                .eq("id", restaurantId)
                .eq("list_id", id)
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

router.patch("/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;
    const {
        name,
        description,
        is_checklist,
        is_featured,
        show_ratings,
        generate_share_token,
        revoke_share_token,
    } = req.body;

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });
    if (list.user_id !== user_id)
        return res.status(403).json({ error: ERRORS.unauthorised });

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) {
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: "List name is required." });
        }
        if (name.trim().length > 100) {
            return res
                .status(400)
                .json({ error: "List name must be 100 characters or less." });
        }
        updates.name = name.trim();
    }
    if (description !== undefined)
        updates.description = description?.trim() || null;
    if (is_checklist !== undefined)
        updates.is_checklist = is_checklist === true;
    if (is_featured !== undefined) updates.is_featured = is_featured === true;
    if (is_featured === true && !list.share_token) {
        updates.share_token = crypto.randomUUID();
    }
    if (show_ratings !== undefined)
        updates.show_ratings = show_ratings === true;
    if (generate_share_token && !list.share_token) {
        updates.share_token = crypto.randomUUID();
    }
    if (revoke_share_token) {
        updates.share_token = null;
        updates.is_featured = false;
    }

    try {
        const { data, error } = await supabase
            .from("lists")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id/restaurants/:restaurantId", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id, restaurantId } = req.params;

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    if (!isOwner) {
        const { data: share } = await supabase
            .from("list_shares")
            .select("permission")
            .eq("list_id", id)
            .eq("user_id", user_id)
            .maybeSingle();

        if (!share || share.permission !== "edit") {
            return res.status(403).json({ error: ERRORS.unauthorised });
        }
    }

    try {
        const { error } = await supabase
            .from("list_restaurants")
            .delete()
            .eq("id", restaurantId)
            .eq("list_id", id);

        if (error) return res.status(500).json({ error: error.message });

        await notifyListUpdated(id, user_id, list.user_id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id/share/:userId", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id, userId } = req.params;

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });

    const isOwner = list.user_id === user_id;
    const isSelf = userId === user_id;

    if (!isOwner && !isSelf) {
        return res.status(403).json({ error: ERRORS.unauthorised });
    }

    try {
        const { error } = await supabase
            .from("list_shares")
            .delete()
            .eq("list_id", id)
            .eq("user_id", userId);

        if (error) return res.status(500).json({ error: error.message });

        if (isSelf && !isOwner) {
            const token = await getMgmtToken();
            const leaverRes = await fetch(
                `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user_id)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const leaverData = await leaverRes.json();

            const { data: reviewData } = await supabase
                .from("reviews")
                .select("reviewer_name, reviewer_picture")
                .eq("user_id", user_id)
                .limit(1)
                .maybeSingle();

            const leaverName = reviewData?.reviewer_name || leaverData.name;
            const leaverPicture =
                reviewData?.reviewer_picture || leaverData.picture;

            await supabase.from("notifications").insert({
                user_id: list.user_id,
                type: "list_updated",
                data: {
                    list_id: id,
                    list_name: list.name,
                    editor_id: user_id,
                    editor_name: leaverName,
                    editor_picture: leaverPicture,
                    is_leave: true,
                },
            });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    const { data: list, error: fetchError } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !list)
        return res.status(404).json({ error: "List not found." });
    if (list.user_id !== user_id)
        return res.status(403).json({ error: ERRORS.unauthorised });

    try {
        const { error } = await supabase.from("lists").delete().eq("id", id);
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
