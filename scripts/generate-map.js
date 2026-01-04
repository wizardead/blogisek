const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const THUMBS_DIR = "../Balkan2024/assets";
const ORIGINALS_DIR = "../Balkan2024/originals";
const OUTPUT_FILE = "../Balkan2024/images.json";

const IMAGE_REGEX = /\.(jpe?g|png|webp)$/i;

/* ---------------- utils ---------------- */

function getImages(dir) {
    return fs.readdirSync(dir)
        .filter(f => IMAGE_REGEX.test(f))
        .map(f => path.join(dir, f));
}

function hamming(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) d++;
    }
    return d;
}

/* ---------------- dHash ---------------- */

async function dHash(file) {
    // dHash = 9x8 grayscale comparison
    const { data } = await sharp(file)
        .grayscale()
        .resize(9, 8, { fit: "fill" })
        .raw()
        .toBuffer({ resolveWithObject: true });

    let hash = "";

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const left = data[y * 9 + x];
            const right = data[y * 9 + x + 1];
            hash += left > right ? "1" : "0";
        }
    }

    return hash;
}

/* ---------------- main ---------------- */

(async () => {
    console.log("🔍 Hashing thumbnails...");
    const thumbs = await Promise.all(
        getImages(THUMBS_DIR).map(async file => ({
            file,
            hash: await dHash(file)
        }))
    );

    console.log("🔍 Hashing originals...");
    const originals = await Promise.all(
        getImages(ORIGINALS_DIR).map(async file => ({
            file,
            hash: await dHash(file)
        }))
    );

    const mapping = {};
    const usedOriginals = new Set();

    for (const thumb of thumbs) {
        let best = null;
        let bestScore = Infinity;

        for (const orig of originals) {
            if (usedOriginals.has(orig.file)) continue;

            const score = hamming(thumb.hash, orig.hash);
            if (score < bestScore) {
                bestScore = score;
                best = orig;
            }
        }

        if (!best || bestScore > 10) {
            console.warn(
                "⚠ Weak match:",
                path.basename(thumb.file),
                `(distance ${bestScore})`
            );
            continue;
        }

        usedOriginals.add(best.file);

        mapping[
            "./assets/" + path.basename(thumb.file)
        ] = "./originals/" + path.basename(best.file);

        console.log(
            "✔",
            path.basename(thumb.file),
            "→",
            path.basename(best.file),
            `(distance ${bestScore})`
        );
    }

    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(mapping, null, 2)
    );

    console.log("\n✅ images.json generated");
})();
