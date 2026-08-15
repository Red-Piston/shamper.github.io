const windowEl = document.getElementById("window");
const tabs = document.querySelectorAll(".tab");

let contentDoc = null;
let pendingDirectUtilId = null;

function getUrlParams() {
    let search = window.location.search;
    if (search.includes("?") && search.indexOf("?") !== search.lastIndexOf("?")) {
        search = search.replace(/\?/g, (m, offset) => offset === search.indexOf("?") ? "?" : "&");
    }
    return new URLSearchParams(search);
}

// Check initial query params
const initialParams = getUrlParams();
const initialUtil = initialParams.get("util");
if (initialUtil) {
    window.openedViaDirectUtil = true;
    pendingDirectUtilId = initialUtil;
}

// загружаем HTML один раз
fetch("content.html")
    .then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        contentDoc = parser.parseFromString(html, "text/html");

        const params = getUrlParams();
        const startTab = initialUtil ? "utils" : (params.get("tab") || "about");

        navigate(startTab);
    });

function render(tab) {
    const section = contentDoc.getElementById(tab);

    if (!section) return;

    // fade out
    windowEl.classList.add("hide");

    setTimeout(() => {
        windowEl.innerHTML = section.innerHTML;

        // fade in
        windowEl.classList.remove("hide");

        if (tab === "portfolio") {
            initPortfolio();
        } else if (tab === "utils") {
            initUtilsTab();
        }
    }, 200);

    updateLastUpdate();
}

function navigate(tab) {
    console.log("navigate:", tab);

    render(tab);

    tabs.forEach(t => {
        t.classList.toggle("active", t.dataset.tab === tab);
    });

    if (tab !== "utils" || !pendingDirectUtilId) {
        history.replaceState({}, "", `?tab=${tab}`);
    }
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        navigate(tab.dataset.tab);
    });
});

document.addEventListener("click", (e) => {
    const avatar = e.target.closest(".avatar-wrapper");

    if (!avatar) return;

    avatar.classList.add("avatar-rotating");

    setTimeout(() => {
        avatar.classList.remove("avatar-rotating");
    }, 1000);
});

async function initPortfolio() {
    if (!window.projectsLoaded) {
        await window.loadProjects();
        window.projectsLoaded = true;
    }

    renderProjects();
}

async function initUtilsTab() {
    if (!window.utilsLoaded) {
        await window.loadUtils();
        window.utilsLoaded = true;
    }

    renderUtils();

    if (pendingDirectUtilId) {
        const utilId = pendingDirectUtilId;
        pendingDirectUtilId = null;
        if (window.utilsMap && window.utilsMap.has(utilId)) {
            setTimeout(() => {
                openUtilModal(utilId);
            }, 100);
        }
    }
}