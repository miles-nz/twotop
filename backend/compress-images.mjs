import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKETS = ["review-images", "profile-pictures"];
const MAX_SIZE = 1200;
const QUALITY = 80;

const processImage = async (buffer) => {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const needsResize = metadata.width > MAX_SIZE || metadata.height > MAX_SIZE;

    return image
        .rotate()
        .resize(
            needsResize ? MAX_SIZE : undefined,
            needsResize ? MAX_SIZE : undefined,
            { fit: "inside", withoutEnlargement: true },
        )
        .jpeg({ quality: QUALITY })
        .toBuffer();
};

const compressBucket = async (bucketName) => {
    console.log(`\nProcessing bucket: ${bucketName}`);

    const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list("", { limit: 1000 });

    if (error) {
        console.error(`Failed to list root of ${bucketName}:`, error.message);
        return;
    }

    const allFiles = [];

    for (const item of files) {
        if (item.metadata) {
            // file
            allFiles.push({ path: item.name, size: item.metadata.size });
        } else {
            // folder
            const { data: subFiles, error: subError } = await supabase.storage
                .from(bucketName)
                .list(item.name, { limit: 1000 });

            if (subError) {
                console.error(
                    `Failed to list folder ${item.name}:`,
                    subError.message,
                );
                continue;
            }

            for (const subFile of subFiles) {
                if (subFile.metadata) {
                    allFiles.push({
                        path: `${item.name}/${subFile.name}`,
                        size: subFile.metadata.size,
                    });
                }
            }
        }
    }

    console.log(`Found ${allFiles.length} files`);

    for (const file of allFiles) {
        try {
            // download
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(file.path);

            const response = await fetch(urlData.publicUrl);
            if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);
            const buffer = Buffer.from(await response.arrayBuffer());

            const originalSize = buffer.length;

            // compress
            const compressed = await processImage(buffer);
            const newSize = compressed.length;

            // reupload
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .update(file.path, compressed, {
                    contentType: "image/jpeg",
                    upsert: true,
                });

            if (uploadError) throw new Error(uploadError.message);

            const saving = (
                ((originalSize - newSize) / originalSize) *
                100
            ).toFixed(1);
            console.log(
                `☑ ${file.path} - ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB (${saving}% smaller)`,
            );
        } catch (err) {
            console.error(`🅇 ${file.path} - ${err.message}`);
        }
    }
};

const run = async () => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables",
        );
        process.exit(1);
    }

    for (const bucket of BUCKETS) {
        await compressBucket(bucket);
    }

    console.log("\nDone.");
};

run();
