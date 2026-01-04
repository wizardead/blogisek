const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let imageMap = {};

fetch("./images.json")
    .then(res => res.json())
    .then(map => {
        imageMap = map;
        console.log("📸 Image mapping loaded");
    })
    .catch(err => {
        console.warn("⚠ Could not load images.json", err);
    });

document.addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;

    const thumbSrc = e.target.getAttribute("src");

    const fullSrc = imageMap[thumbSrc] || thumbSrc;

    lightboxImg.src = fullSrc;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
});

lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }
});
