import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fetch from "node-fetch";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_PROD_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_PROD_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const generateLqip = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    const lqipBuffer = await sharp(buffer)
        .resize(8, 8, { fit: "cover" })
        .jpeg({ quality: 50 })
        .toBuffer();

    return `data:image/jpeg;base64,${lqipBuffer.toString("base64")}`;
};

const run = async () => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
        process.exit(1);
    }

    const { data: reviews, error } = await supabase
        .from("reviews")
        .select("id, image_urls, image_lqips");

    if (error) {
        console.error("Failed to fetch reviews:", error.message);
        process.exit(1);
    }

    const toProcess = reviews.filter(
        (r) =>
            r.image_urls?.length > 0 &&
            (!r.image_lqips || r.image_lqips.length < r.image_urls.length),
    );

    console.log(`Found ${toProcess.length} reviews to backfill`);

    for (const review of toProcess) {
        try {
            const lqips = await Promise.all(
                review.image_urls.map((url) => generateLqip(url)),
            );

            const { error: updateError } = await supabase
                .from("reviews")
                .update({ image_lqips: lqips })
                .eq("id", review.id);

            if (updateError) throw new Error(updateError.message);

            console.log(`☑ ${review.id} - ${lqips.length} LQIPs generated`);
        } catch (err) {
            console.error(`🅇 ${review.id} - ${err.message}`);
        }
    }

    console.log("\nDone.");
};

run();
