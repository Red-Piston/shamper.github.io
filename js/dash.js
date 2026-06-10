document.addEventListener("mouseover", (e) => {
    const dash = e.target.closest(".dash");

    if (!dash) return;

    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.add("dash-hover");
    });
});

document.addEventListener("mouseout", (e) => {
    const dash = e.target.closest(".dash");

    if (!dash) return;

    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("dash-hover");
    });
});