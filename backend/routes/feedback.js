const express = require("express");
const router = express.Router();
const { checkJwt, bugReportRateLimit, upload } = require("../middleware");
const { ERRORS, MAX_BUG_REPORT_LENGTH } = require("../constants");

router.post(
    "/bug-report",
    checkJwt,
    bugReportRateLimit,
    (req, res, next) => {
        upload.single("screenshot")(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            next();
        });
    },
    async (req, res) => {
        const user_id = req.auth.payload.sub;
        const {
            description,
            name,
            email,
            user_agent,
            viewport,
            theme_id,
            color_mode,
        } = req.body;
        let pageHistory = [];
        try {
            pageHistory = JSON.parse(req.body.page_history || "[]");
        } catch {
            pageHistory = [];
        }
        if (
            !description ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return res
                .status(400)
                .json({ error: ERRORS.bugDescriptionRequired });
        }
        if (description.length > MAX_BUG_REPORT_LENGTH) {
            return res
                .status(400)
                .json({ error: ERRORS.bugDescriptionTooLong });
        }
        try {
            const formData = new FormData();
            formData.append(
                "payload_json",
                JSON.stringify({
                    embeds: [
                        {
                            title: "🐛 Bug report",
                            description,
                            color: 0xe74c3c,
                            fields: [
                                {
                                    name: "Reporter",
                                    value: `${name || "Unknown"} (${email || user_id})`,
                                    inline: true,
                                },
                                {
                                    name: "Recent pages",
                                    value: pageHistory.length
                                        ? pageHistory.join(" → ")
                                        : "Unknown",
                                    inline: false,
                                },
                                {
                                    name: "Environment",
                                    value: `Browser: ${user_agent || "Unknown"}\nViewport: ${viewport || "Unknown"}\nTheme: ${theme_id || "Unknown"} (${color_mode || "Unknown"})`,
                                    inline: false,
                                },
                            ],
                            image: req.file
                                ? { url: "attachment://screenshot.png" }
                                : undefined,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                }),
            );

            if (req.file) {
                formData.append(
                    "files[0]",
                    new Blob([req.file.buffer], { type: req.file.mimetype }),
                    "screenshot.png",
                );
            }

            const response = await fetch(
                process.env.DISCORD_BUG_REPORT_WEBHOOK_URL,
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!response.ok)
                throw new Error(`Discord webhook returned ${response.status}`);
            res.status(201).json({ success: true });
        } catch (err) {
            console.error("Failed to send bug report to Discord:", err);
            res.status(500).json({ error: ERRORS.bugReportFailed });
        }
    },
);

module.exports = router;
