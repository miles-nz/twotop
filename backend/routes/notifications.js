const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { checkJwt } = require("../middleware");
const { ERRORS } = require("../constants");

router.get("/", checkJwt, async (req, res) => {
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

router.patch("/read-batch", checkJwt, async (req, res) => {
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
            .eq("user_id", user_id);

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/read", checkJwt, async (req, res) => {
    const user_id = req.auth.payload.sub;
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id)
            .eq("user_id", user_id)
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

module.exports = router;
