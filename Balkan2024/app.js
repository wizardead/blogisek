const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let imageMap = {};
let isMapLoaded = false; // Track if mapping is ready

// Load the image mapping
fetch("./images.json")
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch images.json");
        return res.json();
    })
    .then(map => {
        imageMap = map;
        isMapLoaded = true;
        console.log("📸 Image mapping loaded");
    })
    .catch(err => {
        console.warn("⚠ Could not load images.json – lightbox will use thumbnails as fallback", err);
        isMapLoaded = true; // Still mark as loaded to avoid infinite waiting
    });

// Main click handler for thumbnail images
document.addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;

    const thumbSrc = e.target.getAttribute("src");
    if (!thumbSrc) return;

    // If mapping isn't loaded yet, wait a bit and retry once
    if (!isMapLoaded) {
        // Optional: you could show a loading spinner here
        console.log("Mapping not ready yet, delaying lightbox open...");
        setTimeout(() => openLightbox(thumbSrc), 200);
        return;
    }

    openLightbox(thumbSrc);
});

function openLightbox(thumbSrc) {
    const fullSrc = imageMap[thumbSrc] || thumbSrc;

    // Optional: show loading state
    lightboxImg.src = "";
    lightboxImg.alt = "Loading...";

    lightboxImg.src = fullSrc;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

lightbox.addEventListener("click", (e) => {
        closeLightbox();
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
    }
});

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    lightboxImg.src = ""; // Clear src to save bandwidth
}