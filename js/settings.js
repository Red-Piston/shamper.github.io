// ==========================================
// SITE MICRO-SETTINGS MODULE
// ==========================================

const SETTINGS_KEY = "shamper_site_settings";

const DEFAULT_SETTINGS = {
    matrix: true,
    cursor: true,
    autoplay: true,
    player: true,
    coverTheme: true
};

function getSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        }
    } catch (e) {
        console.error("Failed to load settings from localStorage:", e);
    }
    return { ...DEFAULT_SETTINGS };
}

function saveSetting(key, val) {
    const settings = getSettings();
    settings[key] = val;
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save setting to localStorage:", e);
    }
    applySettings();
}

function applySettings() {
    const settings = getSettings();
    window.siteSettings = settings;

    // 1. Matrix Background
    if (settings.matrix) {
        document.documentElement.classList.remove("purple-gradient-bg");
        document.body.classList.remove("purple-gradient-bg");
        window.matrixEnabled = true;
    } else {
        document.documentElement.classList.add("purple-gradient-bg");
        document.body.classList.add("purple-gradient-bg");
        window.matrixEnabled = false;
    }

    // 2. Custom Cursor
    const cursorEl = document.getElementById("cursor");
    if (settings.cursor) {
        document.documentElement.classList.remove("system-cursor-active");
        document.body.classList.remove("system-cursor-active");
        cursorEl?.classList.remove("disabled-cursor");
    } else {
        document.documentElement.classList.add("system-cursor-active");
        document.body.classList.add("system-cursor-active");
        cursorEl?.classList.add("disabled-cursor");
    }

    // 3. Audio Player & Autoplay
    const playerEl = document.querySelector(".player");
    const audioEl = document.getElementById("audio");

    const mobileNowBarEl = document.getElementById("mobileNowBar");

    if (settings.player) {
        playerEl?.classList.remove("hidden-player");
    } else {
        playerEl?.classList.add("hidden-player");
        playerEl?.classList.remove("expanded");
        document.body.classList.remove("player-expanded");
        if (audioEl && !audioEl.paused) {
            audioEl.pause();
        }
    }

    // 4. Dynamic Cover Theme
    if (settings.coverTheme === false) {
        if (typeof window.revertCoverColors === "function") {
            window.revertCoverColors();
        }
    } else if (typeof window.applyCurrentTrackColors === "function") {
        window.applyCurrentTrackColors();
    }
}

function openSettingsModal() {
    const modal = document.getElementById("modal");
    const modalContent = modal?.querySelector(".modal-content");
    if (!modal || !modalContent) return;

    const settings = getSettings();
    modalContent.classList.remove("wide");

    modalContent.innerHTML = `
        <button class="modal-close-btn" id="settingsModalCloseBtn" aria-label="Закрыть">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="settings-list">
            <!-- 1. Фон матрица -->
            <div class="settings-card">
                <div class="settings-card-info">
                    <span class="settings-card-title">Фон матрица</span>
                    <p class="settings-card-desc">Анимированные символы матрицы на заднем плане. При выключении активируется тёмно-фиолетовый градиент.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" id="settingMatrixToggle" ${settings.matrix ? 'checked' : ''}>
                    <span class="slider-toggle"></span>
                </label>
            </div>

            <!-- 2. Кастомный курсор -->
            <div class="settings-card" id="settingCursorCard">
                <div class="settings-card-info">
                    <span class="settings-card-title">Кастомный курсор</span>
                    <p class="settings-card-desc">Фирменный курсор сайта. При выключении возвращается стандартный системный курсор.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" id="settingCursorToggle" ${settings.cursor ? 'checked' : ''}>
                    <span class="slider-toggle"></span>
                </label>
            </div>

            <!-- 3. Аудиоплеер -->
            <div class="settings-card">
                <div class="settings-card-info">
                    <span class="settings-card-title">Аудиоплеер</span>
                    <p class="settings-card-desc">Отображение плеера внизу экрана и воспроизведение музыки.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" id="settingPlayerToggle" ${settings.player ? 'checked' : ''}>
                    <span class="slider-toggle"></span>
                </label>
            </div>

            <!-- 4. Авто-воспроизведение музыки -->
            <!-- 4. Авто-воспроизведение музыки -->
            <div class="settings-card" id="settingAutoplayCard" style="display: ${settings.player ? 'flex' : 'none'};">
                <div class="settings-card-info">
                    <span class="settings-card-title">Авто-воспроизведение музыки</span>
                    <p class="settings-card-desc">Автоматическое включение трека при первом клике на сайте.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" id="settingAutoplayToggle" ${settings.autoplay ? 'checked' : ''}>
                    <span class="slider-toggle"></span>
                </label>
            </div>

            <!-- 5. Тема по обложке трека -->
            <div class="settings-card" id="settingCoverThemeCard" style="display: ${settings.player ? 'flex' : 'none'};">
                <div class="settings-card-info">
                    <span class="settings-card-title">Цвета под трек</span>
                    <p class="settings-card-desc">Окрашивание фона, имени, обводки аватара, кнопок навбара и ползунка в цвет обложки играющего трека.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" id="settingCoverThemeToggle" ${settings.coverTheme !== false ? 'checked' : ''}>
                    <span class="slider-toggle"></span>
                </label>
            </div>

            <!-- Предупреждающий контейнер -->
            <div class="settings-warning-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-warning-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Для полного изменения некоторых настроек может потребоваться перезагрузка вкладки с сайтом</span>
            </div>

            <!-- Ссылка на репозиторий / исходный код -->
            <a href="https://github.com/Red-Piston/shamper.github.io" target="_blank" rel="noopener noreferrer" class="settings-repo-link" style="text-decoration: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Репозиторий сайта (Исходный код)</span>
            </a>
        </div>
    `;

    modal.classList.add("open");

    // Event listeners for toggles
    const matrixToggle = document.getElementById("settingMatrixToggle");
    const cursorToggle = document.getElementById("settingCursorToggle");
    const playerToggle = document.getElementById("settingPlayerToggle");
    const autoplayToggle = document.getElementById("settingAutoplayToggle");
    const autoplayCard = document.getElementById("settingAutoplayCard");
    const coverThemeToggle = document.getElementById("settingCoverThemeToggle");
    const coverThemeCard = document.getElementById("settingCoverThemeCard");

    matrixToggle?.addEventListener("change", (e) => {
        saveSetting("matrix", e.target.checked);
    });

    cursorToggle?.addEventListener("change", (e) => {
        saveSetting("cursor", e.target.checked);
    });

    playerToggle?.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        saveSetting("player", isEnabled);
        if (autoplayCard) {
            autoplayCard.style.display = isEnabled ? "flex" : "none";
        }
        if (coverThemeCard) {
            coverThemeCard.style.display = isEnabled ? "flex" : "none";
        }
    });

    autoplayToggle?.addEventListener("change", (e) => {
        saveSetting("autoplay", e.target.checked);
    });

    coverThemeToggle?.addEventListener("change", (e) => {
        saveSetting("coverTheme", e.target.checked);
    });
}

// Initialize settings right away
applySettings();

// Export globals
window.getSiteSettings = getSettings;
window.saveSiteSetting = saveSetting;
window.applySiteSettings = applySettings;
window.openSettingsModal = openSettingsModal;
