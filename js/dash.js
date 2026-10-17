document.addEventListener("mouseover", (e) => {
    const dash = e.target.closest(".dash");

    if (!dash) return;

    const navCapsule = document.querySelector(".nav-capsule");
    if (navCapsule) {
        navCapsule.classList.add("dash-hover");
    }
});

document.addEventListener("mouseout", (e) => {
    const dash = e.target.closest(".dash");

    if (!dash) return;

    const navCapsule = document.querySelector(".nav-capsule");
    if (navCapsule) {
        navCapsule.classList.remove("dash-hover");
    }
});