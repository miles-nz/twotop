const express = require("express");
const router = express.Router();
const { checkJwt, placesRateLimit } = require("../middleware");
const { GOOGLE_PLACES_API_URL } = require("../constants");

router.get("/search", checkJwt, placesRateLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });
    try {
        const response = await fetch(
            `${GOOGLE_PLACES_API_URL}/places:autocomplete`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                },
                body: JSON.stringify({
                    input: q,
                    includedPrimaryTypes: [
                        "restaurant",
                        "cafe",
                        "bar",
                        "bakery",
                        "food_court",
                    ],
                    locationBias: {
                        rectangle: {
                            low: { latitude: -47.5, longitude: 166.0 },
                            high: { latitude: -34.0, longitude: 178.5 },
                        },
                    },
                    includedRegionCodes: ["nz"],
                }),
            },
        );
        const data = await response.json();
        const suggestions = (data.suggestions || []).map((s) => ({
            place_id: s.placePrediction.placeId,
            name: s.placePrediction.structuredFormat.mainText.text,
            address:
                s.placePrediction.structuredFormat.secondaryText?.text || "",
        }));
        res.status(200).json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/details", checkJwt, async (req, res) => {
    const { place_id } = req.query;
    if (!place_id)
        return res.status(400).json({ error: "place_id is required" });
    try {
        const response = await fetch(
            `${GOOGLE_PLACES_API_URL}/places/${place_id}`,
            {
                headers: {
                    "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": "id,displayName,addressComponents",
                },
            },
        );
        const data = await response.json();

        const getComponent = (types) =>
            data.addressComponents?.find(
                (c) => c.types && types.some((t) => c.types.includes(t)),
            )?.longText || "";

        const subpremise = getComponent(["subpremise"]);
        const streetNumber = getComponent(["street_number"]);
        const route = getComponent(["route"]);

        const suburb = getComponent([
            "sublocality",
            "sublocality_level_1",
            "neighborhood",
        ]);
        let city = getComponent(["locality"]);
        if (city === "Westfield") {
            city = getComponent(["administrative_area_level_1"]);
        }
        const country =
            getComponent(["country"]) === "New Zealand"
                ? ""
                : getComponent(["country"]);

        const streetAddress = [
            subpremise,
            streetNumber && route ? `${streetNumber} ${route}` : route,
        ]
            .filter(Boolean)
            .join("/");

        const parts = [streetAddress, suburb, city, country].filter(Boolean);

        res.status(200).json({
            place_id: data.id,
            name: data.displayName?.text || "",
            address: parts.join(", "),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
