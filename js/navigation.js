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
fetch("content.html?v=" + Date.now(), { cache: "no-cache" })
    .then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        contentDoc = parser.parseFromString(html, "text/html");

        const params = getUrlParams();
        const startTab = initialUtil ? "utils" : (params.get("tab") || "about");

        navigate(startTab);
    });

let heightTransitionTimer = null;
let renderTimer = null;

function animateWindowHeight() {
    if (!windowEl) return;
    if (window.innerWidth <= 768) {
        windowEl.style.height = "auto";
        return;
    }
    const startHeight = windowEl.offsetHeight;
    if (startHeight === 0) return;

    windowEl.style.height = "auto";
    const maxHeight = window.innerHeight * 0.8;
    const targetHeight = Math.min(windowEl.scrollHeight, maxHeight);

    if (Math.abs(targetHeight - startHeight) < 4) {
        windowEl.style.height = "";
        return;
    }

    windowEl.style.height = `${startHeight}px`;
    void windowEl.offsetHeight;
    windowEl.style.height = `${targetHeight}px`;

    if (heightTransitionTimer) clearTimeout(heightTransitionTimer);
    heightTransitionTimer = setTimeout(() => {
        windowEl.style.height = "";
    }, 400);
}

window.animateWindowHeight = animateWindowHeight;

function render(tab) {
    if (!contentDoc || !windowEl) return;
    const section = contentDoc.getElementById(tab);

    if (!section) return;

    if (renderTimer) {
        clearTimeout(renderTimer);
        renderTimer = null;
    }

    const isFirstLoad = !windowEl.innerHTML.trim();

    if (isFirstLoad) {
        windowEl.innerHTML = section.innerHTML;
        if (tab === "portfolio") {
            initPortfolio();
        } else if (tab === "utils") {
            initUtilsTab();
        } else if (tab === "about") {
            if (typeof updateClock === "function") updateClock();
        }
        updateLastUpdate();
        return;
    }

    // Запоминаем текущую высоту окна
    const startHeight = windowEl.offsetHeight;
    if (startHeight > 0) {
        windowEl.style.height = `${startHeight}px`;
    }

    // Плавно прячем только содержимое (окно остаётся видимым)
    windowEl.classList.add("hide");

    renderTimer = setTimeout(() => {
        windowEl.innerHTML = section.innerHTML;

        if (tab === "portfolio") {
            initPortfolio();
        } else if (tab === "utils") {
            initUtilsTab();
        } else if (tab === "about") {
            if (typeof updateClock === "function") updateClock();
        }

        // Замеряем высоту нового контента
        windowEl.style.height = "auto";
        const maxHeight = window.innerHeight * 0.8;
        const targetHeight = Math.min(windowEl.scrollHeight, maxHeight);

        if (startHeight > 0) {
            windowEl.style.height = `${startHeight}px`;
            void windowEl.offsetHeight; // Reflow
        }

        // Плавно анимируем высоту окна и проявляем новое содержимое
        windowEl.style.height = `${targetHeight}px`;
        windowEl.classList.remove("hide");

        if (heightTransitionTimer) clearTimeout(heightTransitionTimer);
        heightTransitionTimer = setTimeout(() => {
            windowEl.style.height = "";
        }, 400);

        updateLastUpdate();
    }, 200);
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

    window.scrollTo({ top: 0, behavior: "smooth" });
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

document.addEventListener("click", (e) => {
    const wipBtn = e.target.closest("#wipToggleAnywayBtn");
    if (wipBtn) {
        const wipCard = document.querySelector(".utils-mobile-wip");
        if (wipCard) {
            wipCard.classList.toggle("show-anyway");
            wipBtn.textContent = wipCard.classList.contains("show-anyway") 
                ? "Скрыть утилиты" 
                : "Показать всё равно";
        }
    }
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