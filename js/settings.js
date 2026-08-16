// ==========================================
// SITE MICRO-SETTINGS MODULE
// ==========================================

const SETTINGS_KEY = "shamper_site_settings";

const DEFAULT_SETTINGS = {
    matrix: true,
    cursor: true,
    autoplay: true,
    player: true
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

    if (settings.player) {
        playerEl?.classList.remove("hidden-player");
    } else {
        playerEl?.classList.add("hidden-player");
        if (audioEl && !audioEl.paused) {
            audioEl.pause();
        }
    }
}

function openSettingsModal() {
    const modal = document.getElementById("modal");
    const modalContent = modal?.querySelector(".modal-content");
    if (!modal || !modalContent) return;

    const settings = getSettings();
    modalContent.classList.remove("wide");

    modalContent.innerHTML = `
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
            <div class="settings-card">
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

            <!-- Предупреждающий контейнер -->
            <div class="settings-warning-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-warning-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Для полного изменения некоторых настроек может потребоваться перезагрузка вкладки с сайтом</span>
            </div>
        </div>
    `;

    modal.classList.add("open");

    // Event listeners for toggles
    const matrixToggle = document.getElementById("settingMatrixToggle");
    const cursorToggle = document.getElementById("settingCursorToggle");
    const playerToggle = document.getElementById("settingPlayerToggle");
    const autoplayToggle = document.getElementById("settingAutoplayToggle");
    const autoplayCard = document.getElementById("settingAutoplayCard");

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
    });

    autoplayToggle?.addEventListener("change", (e) => {
        saveSetting("autoplay", e.target.checked);
    });
}

// Initialize settings right away
applySettings();

// Export globals
window.getSiteSettings = getSettings;
window.saveSiteSetting = saveSetting;
window.applySiteSettings = applySettings;
window.openSettingsModal = openSettingsModal;
