require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("../supabase");
const { ALLOWED_ORIGINS } = require("./constants");
const { generalRateLimit } = require("./middleware");

const listsRouter = require("./routes/lists");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user");
const friendsRouter = require("./routes/friends");
const notificationsRouter = require("./routes/notifications");
const placesRouter = require("./routes/places");

const app = express();
app.set("trust proxy", 1);

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(generalRateLimit);

app.get("/health", async (req, res) => {
    try {
        const { error } = await supabase.from("lists").select("id").limit(1);
        if (error) throw error;
        res.status(200).json({ status: "ok" });
    } catch (err) {
        res.status(503).json({ status: "error", message: err.message });
    }
});

app.use("/lists", listsRouter);
app.use("/reviews", reviewsRouter);
app.use("/user", userRouter);
app.use("/friends", friendsRouter);
app.use("/notifications", notificationsRouter);
app.use("/places", placesRouter);

app.listen(3000, () => console.log("Server running"));
