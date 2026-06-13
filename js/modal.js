const modal = document.getElementById("modal");
const modalContent = modal?.querySelector(".modal-content");

function formatReach(reach) {
    if (!reach) return "";

    return reach.map(r => {
        const label = reachLabels[r.type] || r.type;
        return `${r.value} ${label}`;
    }).join(" • ");
}

function renderLinks(links) {
    if (!links) return "";

    const icons = {
        GitHub: "assets/social-icons/github.png",
        Telegram: "assets/social-icons/telegram.png",
        Discord: "assets/social-icons/discord.svg",
        YouTube: "assets/social-icons/youtube.png",
        Modrinth: "assets/social-icons/modrinth.png",
        Ссылка: "assets/social-icons/website.svg"
    };

    return `
        <div class="modal-links">
            ${Object.entries(links)
                .filter(([type]) => icons[type])
                .map(([type, url]) => `
                    <a
                        class="project-link-btn"
                        href="${url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="${icons[type]}" alt="${type}">
                    </a>
                `)
                .join("")}
        </div>
    `;
}

function renderTeam(team) {
    if (!team?.length) return "";

    return `
        <div class="modal-section">
            <h3>Команда</h3>

            <div class="team-grid">
                ${team.map(m => `
                    <div class="team-member">
                        <img class="team-avatar" src="${m.avatar || 'assets/default.avif'}">

                        <div style="display:flex; flex-direction:column;">
                            ${
                                m.url
                                    ? `<a href="${m.url}" target="_blank">${m.name}</a>`
                                    : `<no-link class="team-name">${m.name}</no-link>`
                            }
                            <span>${m.role}</span>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function initGalleries() {
    document.querySelectorAll(".gallery").forEach(gallery => {

        let index = 0;

        const imgs = gallery.querySelectorAll(".gallery-img");
        const dots = gallery.parentElement.querySelectorAll(".dot");

        function update() {
            imgs.forEach((img, i) => {
                img.classList.toggle("active", i === index);
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        gallery.querySelector("[data-action='prev']").onclick = (e) => {
            e.stopPropagation();
            index = (index - 1 + imgs.length) % imgs.length;
            update();
        };

        gallery.querySelector("[data-action='next']").onclick = (e) => {
            e.stopPropagation();
            index = (index + 1) % imgs.length;
            update();
        };

        dots.forEach(dot => {
            dot.addEventListener("click", (e) => {
                index = Number(dot.dataset.index);
                update();
            });
        });
    });
}

function renderGallery(gallery, id) {
    if (!gallery?.length) return "";

    return `
        <div class="modal-section">
            <h3>Галерея</h3>

            <div class="gallery" data-gallery="${id}">
                
                <button class="gallery-arrow left" data-action="prev"><img src="assets/buttons/arrow-left.svg" alt="Previous"></button>

                <div class="gallery-track">
                    ${gallery.map((img, i) => `
                        <img
                            src="${img}"
                            class="gallery-img ${i === 0 ? "active" : ""}"
                            data-index="${i}"
                        >
                    `).join("")}
                </div>

                <button class="gallery-arrow right" data-action="next"><img src="assets/buttons/arrow-right.svg" alt="Next"></button>
            </div>

            <div class="gallery-dots">
                ${gallery.map((_, i) => `
                    <span class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>
                `).join("")}
            </div>
        </div>
    `;
}

function renderHistory(history) {
    if (!history?.length) return "";

    return `
        <div class="modal-section">
            <h3>История проекта</h3>

            <div class="project-history">
                ${history.map(item => `
                    <div class="history-item">
                        <div class="history-date">${item.date}</div>
                        <div class="history-text">${item.text}</div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function openModal(id) {
    const project = projectsMap.get(id);
    if (!project) return;

    modalContent.innerHTML = `
        ${renderLinks(project.links)}
        <div class="modal-header ${project.id}">
            <div style="display: flex; flex-direction: row; align-items: center; gap: 15px;">
                <img
                    class="project-icon"
                    src="${project.icon || 'assets/default.avif'}"
                >
                <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; flex-direction: row;">
                        <h1>${project.title}</h1><type>${project.type}</type>
                    </div>
                    <reach>${formatReach(project.reach)}</reach>
                </div>
            </div>
            <p>${project.description || ""}</p>
            <span class="status">${project.status || "unknown"}</span>
        </div>

        ${renderTeam(project.team)}
        ${renderGallery(project.gallery, project.id)}
        ${renderHistory(project.history)}


    `;

    modal.classList.add("open");
    initGalleries();
}

/* close */
modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("open");
    }
});