function getGrid() {
    return document.getElementById("portfolio-grid");
}

const PROJECTS_PER_PAGE = 4;

let currentPage = 1;

function getProjectsArray() {
    return Array.from(projectsMap.values());
}

function getTotalPages() {
    return Math.ceil(projectsMap.size / PROJECTS_PER_PAGE);
}

function renderPagination() {
    const el = document.getElementById("portfolio-pagination");

    if (!el) return;

    const total = getTotalPages();

    el.innerHTML = "";

    for (let i = 1; i <= total; i++) {
        const btn = document.createElement("button");

        btn.className = "page-btn";
        btn.textContent = i;

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => {

            if (currentPage === i) return;

            currentPage = i;

            updatePagination();
            renderProjects();
        });

        el.appendChild(btn);
    }
}

function updatePagination() {
    document.querySelectorAll(".page-btn").forEach((btn, index) => {
        btn.classList.toggle("active", index + 1 === currentPage);
    });
}

const reachLabels = {
    mcplayers: "средний онлайн",
    players: "игроков",
    downloads: "скачиваний",
    members: "участников",
    subs: "подписчиков",
    tracks: "треков",
    count: "шт."
};

function formatReach(reach) {
    if (!reach) return "";

    return reach.map(r => {
        const label = reachLabels[r.type] || r.type;
        return `${r.value} ${label}`;
    }).join(" • ");
}

function createLinks(project) {
    if (!project.links) return "";

    const icons = {
        GitHub: "assets/social-icons/github.png",
        Telegram: "assets/social-icons/telegram.png",
        Discord: "assets/social-icons/discord.svg",
        YouTube: "assets/social-icons/youtube.png",
        Modrinth: "assets/social-icons/modrinth.png",
        Ссылка: "assets/social-icons/website.svg"
    };

    let html = "";

    for (const [type, url] of Object.entries(project.links)) {
        if (!url || !icons[type]) continue;

        html += `
            <a
                class="project-link-btn"
                href="${url}"
                target="_blank"
                rel="noopener noreferrer"
                data-no-modal
            >
                <img src="${icons[type]}" alt="${type}">
            </a>
        `;
    }

    return html;
}

function createCard(project) {
    const el = document.createElement("div");

    el.className = `project-card ${project.id}`;
    el.dataset.id = project.id;

    el.innerHTML = `
        <div class="project-header">
            <img
                class="project-icon"
                src="${project.icon || 'assets/default.avif'}"
            >

            <div style="display:flex; flex-direction:column">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <span class="project-type">${project.type}</span>
                </div>

                <div>
                    <div class="project-reach">
                        ${formatReach(project.reach)}
                    </div>
                </div>
            </div>
        </div>

        <div class="project-footer">
            <div class="project-links">
                ${createLinks(project)}
            </div>

            <button class="project-more">
                Подробнее
            </button>
        </div>
    `;

    return el;
}

function renderProjects() {
    const grid = getGrid();

    if (!grid) return;

    grid.classList.add("hide");

    setTimeout(() => {

        const projects = getProjectsArray();

        const start = (currentPage - 1) * PROJECTS_PER_PAGE;
        const end = start + PROJECTS_PER_PAGE;

        const pageItems = projects.slice(start, end);

        grid.innerHTML = "";

        pageItems.forEach(project => {
            grid.appendChild(createCard(project));
        });

        renderPagination();

        grid.classList.remove("hide");

    }, 200);
}

document.addEventListener("click", (e) => {

    if (e.target.closest("[data-no-modal]")) {
        return;
    }

    const card = e.target.closest(".project-card");

    if (!card) return;

    openModal(card.dataset.id);
});

window.renderProjects = renderProjects;