const utilsMap = new Map();
const UTILS_PER_PAGE = 4;
let currentUtilsPage = 1;

async function loadUtils() {
    const files = ["color-picker.yml", "mini-caps.yml", "server-pinger.yml", "flags-generator.yml"];

    const results = await Promise.all(
        files.map(async (f) => {
            try {
                const res = await fetch("data/utils/" + f);
                const text = await res.text();
                return jsyaml.load(text);
            } catch (err) {
                console.error("Failed to load util:", f, err);
                return null;
            }
        })
    );

    results.forEach(u => {
        if (u && u.id) utilsMap.set(u.id, u);
    });
}

function getUtilsGrid() {
    return document.getElementById("utils-grid");
}

function getUtilsArray() {
    return Array.from(utilsMap.values());
}

function getUtilsTotalPages() {
    return Math.max(1, Math.ceil(utilsMap.size / UTILS_PER_PAGE));
}

function renderUtilsPagination() {
    const el = document.getElementById("utils-pagination");
    if (!el) return;

    const total = getUtilsTotalPages();
    el.innerHTML = "";

    if (total <= 1) return;

    for (let i = 1; i <= total; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        btn.textContent = i;

        if (i === currentUtilsPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => {
            if (currentUtilsPage === i) return;
            currentUtilsPage = i;
            updateUtilsPagination();
            renderUtils();
        });

        el.appendChild(btn);
    }
}

function updateUtilsPagination() {
    document.querySelectorAll("#utils-pagination .page-btn").forEach((btn, index) => {
        btn.classList.toggle("active", index + 1 === currentUtilsPage);
    });
}

function createUtilCard(util) {
    const el = document.createElement("div");
    el.className = `project-card util-card ${util.id}`;
    el.dataset.id = util.id;

    el.innerHTML = `
        <div class="project-header">
            <img class="project-icon" src="${util.icon || 'assets/social-icons/website.svg'}" alt="${util.title}">
            <div style="display:flex; flex-direction:column; flex: 1;">
                <div class="project-info">
                    <h3>${util.title}</h3>
                    <span class="project-type">${util.type || 'Утилита'}</span>
                </div>
            </div>
        </div>
        <p class="util-card-desc">${util.description || ''}</p>
        <div class="project-footer" style="justify-content: flex-end;">
            <button class="project-more util-open-btn">
                Открыть
            </button>
        </div>
    `;

    return el;
}

function renderUtils() {
    const grid = getUtilsGrid();
    if (!grid) return;

    grid.classList.add("hide");

    setTimeout(() => {
        const utils = getUtilsArray();
        const start = (currentUtilsPage - 1) * UTILS_PER_PAGE;
        const end = start + UTILS_PER_PAGE;
        const pageItems = utils.slice(start, end);

        grid.innerHTML = "";
        pageItems.forEach(util => {
            grid.appendChild(createUtilCard(util));
        });

        renderUtilsPagination();
        grid.classList.remove("hide");
    }, 200);
}

// Click listener for util cards
document.addEventListener("click", (e) => {
    const card = e.target.closest(".util-card");
    if (!card) return;
    openUtilModal(card.dataset.id);
});

// Open Wide Utility Modal
function openUtilModal(id) {
    const util = utilsMap.get(id);
    if (!util) return;

    const modal = document.getElementById("modal");
    const modalContent = modal?.querySelector(".modal-content");
    if (!modal || !modalContent) return;

    modalContent.classList.add("wide");

    let componentHtml = "";
    if (util.id === "color-picker") {
        componentHtml = getColorPickerHtml();
    } else if (util.id === "mini-caps") {
        componentHtml = getMiniCapsHtml();
    } else if (util.id === "server-pinger") {
        componentHtml = getServerPingerHtml();
    } else if (util.id === "flags-generator") {
        componentHtml = getFlagsGeneratorHtml();
    } else {
        componentHtml = `<div class="util-generic-body"><p>${util.description}</p></div>`;
    }

    modalContent.innerHTML = `
        <div class="util-modal-header">
            <div class="util-modal-title-row">
                <div style="display:flex; align-items:center; gap: 12px;">
                    <img class="project-icon" src="${util.icon || 'assets/social-icons/website.svg'}" alt="${util.title}">
                    <div>
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <h1 style="margin:0; font-size:1.8em;">${util.title}</h1>
                            <span class="project-type">${util.type || 'Утилита'}</span>
                        </div>
                        <p style="margin:4px 0 0; color:#aaa; font-size:0.9em;">${util.description || ''}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="util-modal-body">
            ${componentHtml}
        </div>
    `;

    modal.classList.add("open");

    // Initialize interactive logic
    if (util.id === "color-picker") {
        initColorPicker();
    } else if (util.id === "mini-caps") {
        initMiniCaps();
    } else if (util.id === "server-pinger") {
        initServerPinger();
    } else if (util.id === "flags-generator") {
        initFlagsGenerator();
    }

    // Update URL query string
    history.replaceState({}, "", `?tab=utils&util=${id}`);
}

function closeModal() {
    const modal = document.getElementById("modal");
    const modalContent = modal?.querySelector(".modal-content");
    if (modal) {
        modal.classList.remove("open");
        modalContent?.classList.remove("wide");
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("util")) {
        history.replaceState({}, "", `?tab=utils`);
    }

    if (window.openedViaDirectUtil) {
        window.openedViaDirectUtil = false;
        if (typeof window.startDelayedPlayback === "function") {
            window.startDelayedPlayback();
        }
    }
}

// Global modal overlay click handling for closing
document.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        closeModal();
    }
});

// ESC key to close modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById("modal");
        if (modal?.classList.contains("open")) {
            closeModal();
        }
    }
});

// Toast notification for copying
let toastTimer = null;
function showToast(message = "Скопировано") {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");
    if (!toast) return;
    if (toastText) toastText.textContent = message;

    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

// Helper for copying text with toast feedback
function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Скопировано");
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

window.showToast = showToast;
window.copyToClipboard = copyToClipboard;

// ==========================================
// 1. COLOR PICKER COMPONENT (Google-like)
// ==========================================

function getColorPickerHtml() {
    return `
        <div class="color-picker-container">
            <div class="cp-visual-area">
                <div class="cp-spectrum-box" id="cpSpectrum">
                    <div class="cp-spectrum-white"></div>
                    <div class="cp-spectrum-black"></div>
                    <div class="cp-picker-handle" id="cpPickerHandle"></div>
                </div>

                <div class="cp-controls-bar">
                    <div class="cp-preview-swatch" id="cpPreviewSwatch" title="Нажмите, чтобы скопировать HEX">
                        <span class="cp-preview-hex" id="cpPreviewHex">#4285F4</span>
                    </div>
                    <div class="cp-sliders-col">
                        <div class="cp-slider-track cp-hue-slider" id="cpHueSlider">
                            <div class="cp-slider-handle" id="cpHueHandle"></div>
                        </div>
                    </div>
                    ${window.EyeDropper ? `<button class="cp-eyedropper-btn" id="cpEyeDropperBtn" title="Пипетка (EyeDropper)">🔍</button>` : ''}
                </div>
            </div>

            <div class="cp-values-area">
                <div class="cp-format-group">
                    <div class="cp-row">
                        <span class="cp-label">HEX</span>
                        <input type="text" class="cp-input" id="cpInputHex" value="#4285F4">
                        <button class="cp-copy-btn" data-copy-target="cpInputHex">Копировать</button>
                    </div>
                    <div class="cp-row">
                        <span class="cp-label">RGB</span>
                        <input type="text" class="cp-input" id="cpInputRgb" value="rgb(66, 133, 244)">
                        <button class="cp-copy-btn" data-copy-target="cpInputRgb">Копировать</button>
                    </div>
                    <div class="cp-row">
                        <span class="cp-label">HSL</span>
                        <input type="text" class="cp-input" id="cpInputHsl" value="hsl(217, 89%, 61%)">
                        <button class="cp-copy-btn" data-copy-target="cpInputHsl">Копировать</button>
                    </div>
                    <div class="cp-row">
                        <span class="cp-label">HSV</span>
                        <input type="text" class="cp-input" id="cpInputHsv" value="hsv(217, 73%, 96%)">
                        <button class="cp-copy-btn" data-copy-target="cpInputHsv">Копировать</button>
                    </div>
                    <div class="cp-row">
                        <span class="cp-label">CMYK</span>
                        <input type="text" class="cp-input" id="cpInputCmyk" value="cmyk(73%, 45%, 0%, 4%)">
                        <button class="cp-copy-btn" data-copy-target="cpInputCmyk">Копировать</button>
                    </div>
                </div>

                <div class="cp-presets-title">Пресеты</div>
                <div class="cp-presets-grid" id="cpPresetsGrid">
                    ${[
                        '#4285F4', '#EA4335', '#FBBC05', '#34A853',
                        '#ff00fb', '#a771da', '#00f2fe', '#4facfe',
                        '#111111', '#ffffff', '#7a7a7a', '#222222',
                        '#ff7675', '#74b9ff', '#55efc4', '#ffeaa7'
                    ].map(hex => `<div class="cp-preset-color" style="background:${hex};" data-color="${hex}"></div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function initColorPicker() {
    let currentHue = 217;       // 0 - 360
    let currentSat = 0.73;     // 0 - 1
    let currentVal = 0.96;     // 0 - 1

    const spectrum = document.getElementById("cpSpectrum");
    const pickerHandle = document.getElementById("cpPickerHandle");
    const hueSlider = document.getElementById("cpHueSlider");
    const hueHandle = document.getElementById("cpHueHandle");
    const swatch = document.getElementById("cpPreviewSwatch");
    const previewHex = document.getElementById("cpPreviewHex");
    const eyedropperBtn = document.getElementById("cpEyeDropperBtn");

    const inputHex = document.getElementById("cpInputHex");
    const inputRgb = document.getElementById("cpInputRgb");
    const inputHsl = document.getElementById("cpInputHsl");
    const inputHsv = document.getElementById("cpInputHsv");
    const inputCmyk = document.getElementById("cpInputCmyk");

    function hsvToRgb(h, s, v) {
        let r, g, b;
        let i = Math.floor((h / 60) % 6);
        let f = (h / 60) - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h: Math.round(h), s, v };
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length !== 6) return null;
        let num = parseInt(hex, 16);
        if (isNaN(num)) return null;
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function rgbToCmyk(r, g, b) {
        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);
        let k = Math.min(c, m, y);
        if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
        return {
            c: Math.round(((c - k) / (1 - k)) * 100),
            m: Math.round(((m - k) / (1 - k)) * 100),
            y: Math.round(((y - k) / (1 - k)) * 100),
            k: Math.round(k * 100)
        };
    }

    function updateColorUI() {
        if (!spectrum) return;
        spectrum.style.backgroundColor = `hsl(${currentHue}, 100%, 50%)`;

        const rgb = hsvToRgb(currentHue, currentSat, currentVal);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

        if (swatch) swatch.style.backgroundColor = hex;
        if (previewHex) previewHex.textContent = hex;

        if (inputHex && document.activeElement !== inputHex) inputHex.value = hex;
        if (inputRgb && document.activeElement !== inputRgb) inputRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (inputHsl && document.activeElement !== inputHsl) inputHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        if (inputHsv && document.activeElement !== inputHsv) inputHsv.value = `hsv(${Math.round(currentHue)}, ${Math.round(currentSat * 100)}%, ${Math.round(currentVal * 100)}%)`;
        if (inputCmyk && document.activeElement !== inputCmyk) inputCmyk.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

        // Update handle positions
        if (pickerHandle) {
            pickerHandle.style.left = `${currentSat * 100}%`;
            pickerHandle.style.top = `${(1 - currentVal) * 100}%`;
        }
        if (hueHandle) {
            hueHandle.style.left = `${(currentHue / 360) * 100}%`;
        }
    }

    function setFromHex(hexStr) {
        const rgb = hexToRgb(hexStr);
        if (!rgb) return;
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        currentHue = hsv.h;
        currentSat = hsv.s;
        currentVal = hsv.v;
        updateColorUI();
    }

    function setFromRgb(rgbStr) {
        const numbers = rgbStr.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 3) return;
        const r = Math.min(255, Math.max(0, parseInt(numbers[0], 10)));
        const g = Math.min(255, Math.max(0, parseInt(numbers[1], 10)));
        const b = Math.min(255, Math.max(0, parseInt(numbers[2], 10)));
        if (isNaN(r) || isNaN(g) || isNaN(b)) return;
        const hsv = rgbToHsv(r, g, b);
        currentHue = hsv.h;
        currentSat = hsv.s;
        currentVal = hsv.v;
        updateColorUI();
    }

    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    }

    function setFromHsl(hslStr) {
        const numbers = hslStr.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 3) return;
        const h = Math.min(360, Math.max(0, parseFloat(numbers[0])));
        const s = Math.min(100, Math.max(0, parseFloat(numbers[1])));
        const l = Math.min(100, Math.max(0, parseFloat(numbers[2])));
        if (isNaN(h) || isNaN(s) || isNaN(l)) return;
        const rgb = hslToRgb(h, s, l);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        currentHue = h;
        currentSat = hsv.s;
        currentVal = hsv.v;
        updateColorUI();
    }

    function setFromHsv(hsvStr) {
        const numbers = hsvStr.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 3) return;
        const h = Math.min(360, Math.max(0, parseFloat(numbers[0])));
        const s = Math.min(100, Math.max(0, parseFloat(numbers[1])));
        const v = Math.min(100, Math.max(0, parseFloat(numbers[2])));
        if (isNaN(h) || isNaN(s) || isNaN(v)) return;
        currentHue = h;
        currentSat = s / 100;
        currentVal = v / 100;
        updateColorUI();
    }

    function setFromCmyk(cmykStr) {
        const numbers = cmykStr.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 4) return;
        const c = Math.min(100, Math.max(0, parseFloat(numbers[0])));
        const m = Math.min(100, Math.max(0, parseFloat(numbers[1])));
        const y = Math.min(100, Math.max(0, parseFloat(numbers[2])));
        const k = Math.min(100, Math.max(0, parseFloat(numbers[3])));
        if (isNaN(c) || isNaN(m) || isNaN(y) || isNaN(k)) return;
        const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
        const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
        const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
        const hsv = rgbToHsv(r, g, b);
        currentHue = hsv.h;
        currentSat = hsv.s;
        currentVal = hsv.v;
        updateColorUI();
    }

    // Spectrum dragging
    let isDraggingSpectrum = false;
    function handleSpectrumMove(e) {
        const rect = spectrum.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        let y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        currentSat = x / rect.width;
        currentVal = 1 - (y / rect.height);
        updateColorUI();
    }

    spectrum?.addEventListener("mousedown", (e) => {
        isDraggingSpectrum = true;
        handleSpectrumMove(e);
    });

    spectrum?.addEventListener("touchstart", (e) => {
        isDraggingSpectrum = true;
        handleSpectrumMove(e);
    }, { passive: true });

    // Hue dragging
    let isDraggingHue = false;
    function handleHueMove(e) {
        const rect = hueSlider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        currentHue = Math.min(360, Math.max(0, (x / rect.width) * 360));
        updateColorUI();
    }

    hueSlider?.addEventListener("mousedown", (e) => {
        isDraggingHue = true;
        handleHueMove(e);
    });

    hueSlider?.addEventListener("touchstart", (e) => {
        isDraggingHue = true;
        handleHueMove(e);
    }, { passive: true });

    window.addEventListener("mousemove", (e) => {
        if (isDraggingSpectrum) handleSpectrumMove(e);
        if (isDraggingHue) handleHueMove(e);
    });

    window.addEventListener("touchmove", (e) => {
        if (isDraggingSpectrum) handleSpectrumMove(e);
        if (isDraggingHue) handleHueMove(e);
    }, { passive: true });

    window.addEventListener("mouseup", () => {
        isDraggingSpectrum = false;
        isDraggingHue = false;
    });

    window.addEventListener("touchend", () => {
        isDraggingSpectrum = false;
        isDraggingHue = false;
    });

    // Inputs
    inputHex?.addEventListener("input", (e) => {
        let val = e.target.value.trim();
        if (/^#?[0-9A-Fa-f]{6}$/.test(val) || /^#?[0-9A-Fa-f]{3}$/.test(val)) {
            setFromHex(val);
        }
    });

    inputRgb?.addEventListener("input", (e) => {
        setFromRgb(e.target.value);
    });

    inputHsl?.addEventListener("input", (e) => {
        setFromHsl(e.target.value);
    });

    inputHsv?.addEventListener("input", (e) => {
        setFromHsv(e.target.value);
    });

    inputCmyk?.addEventListener("input", (e) => {
        setFromCmyk(e.target.value);
    });

    // Presets
    document.querySelectorAll(".cp-preset-color").forEach(preset => {
        preset.addEventListener("click", () => {
            const hex = preset.dataset.color;
            if (hex) setFromHex(hex);
        });
    });

    // Swatch click to copy
    swatch?.addEventListener("click", () => {
        const rgb = hsvToRgb(currentHue, currentSat, currentVal);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        copyToClipboard(hex);
    });

    // Copy buttons
    document.querySelectorAll(".cp-copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.copyTarget;
            const input = document.getElementById(targetId);
            if (input) {
                copyToClipboard(input.value);
            }
        });
    });

    // EyeDropper API
    eyedropperBtn?.addEventListener("click", async () => {
        if (window.EyeDropper) {
            const eyeDropper = new EyeDropper();
            try {
                const result = await eyeDropper.open();
                if (result && result.sRGBHex) {
                    setFromHex(result.sRGBHex);
                }
            } catch (e) {
                console.log("EyeDropper closed/cancelled:", e);
            }
        }
    });

    // Initial draw
    setFromHex("#4285F4");
}

// ==========================================
// 2. MINI CAPS GENERATOR COMPONENT
// ==========================================

const SMALL_CAPS_MAP = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ',
    'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
    'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
    'y': 'ʏ', 'z': 'ᴢ',
    'а': 'ᴀ', 'б': 'б', 'в': 'в', 'г': 'г', 'д': 'д', 'е': 'ᴇ', 'ж': 'ж', 'з': 'з',
    'и': 'и', 'й': 'й', 'к': 'к', 'л': 'л', 'м': 'ᴍ', 'н': 'ɴ', 'о': 'ᴏ', 'п': 'п',
    'р': 'ᴘ', 'с': 'с', 'т': 'ᴛ', 'у': 'у', 'ф': 'ф', 'х': 'х', 'ц': 'ц', 'ч': 'ч',
    'ш': 'ш', 'щ': 'щ', 'ъ': 'ъ', 'ы': 'ы', 'ь': 'ь', 'э': 'э', 'ю': 'ю', 'я': 'я'
};

function convertToSmallCaps(str, mode = "normal") {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const lower = char.toLowerCase();
        const isUpper = char >= 'A' && char <= 'Z';

        if (mode === "capitalize_first" && isUpper) {
            result += char;
        } else if (SMALL_CAPS_MAP[lower]) {
            result += SMALL_CAPS_MAP[lower];
        } else {
            result += char;
        }
    }

    if (mode === "spaced") {
        result = result.split('').join(' ');
    }
    return result;
}

function getMiniCapsHtml() {
    return `
        <div class="mini-caps-container">
            <div class="mc-input-area">
                <div class="mc-label-row">
                    <span class="mc-label">Исходный текст</span>
                    <button class="mc-clear-btn" id="mcClearBtn">Очистить</button>
                </div>
                <textarea id="mcInputText" class="mc-textarea" placeholder="Введите ваш текст сюда (например: hello world или camper crafting)..." rows="4"></textarea>

                <div class="mc-options-row">
                    <span class="mc-options-label">Режим:</span>
                    <label class="mc-radio-label">
                        <input type="radio" name="mcMode" value="normal" checked> Все маленькие капсом (ᴀʙᴄ)
                    </label>
                    <label class="mc-radio-label">
                        <input type="radio" name="mcMode" value="capitalize_first"> Сохранять большие буквы (Abc)
                    </label>
                    <label class="mc-radio-label">
                        <input type="radio" name="mcMode" value="spaced"> С пробелами (ᴀ ʙ ᴄ)
                    </label>
                </div>
            </div>

            <div class="mc-output-area">
                <div class="mc-label-row">
                    <span class="mc-label">Результат (Mini Caps / Small Caps Unicode)</span>
                    <span class="mc-char-count" id="mcCharCount">Символов: 0</span>
                </div>
                <div class="mc-output-box" id="mcOutputBox">
                    <span class="mc-placeholder">Здесь появится сконвертированный текст...</span>
                </div>
                <div class="div-mc-big-copy-btn">
                    <button class="mc-big-copy-btn" id="mcCopyBtn">
                        Копировать
                    </button>
                </div>
            </div>

            <div class="mc-quick-samples">
                <span class="mc-samples-label">Быстрые примеры:</span>
                <button class="mc-sample-btn" data-text="hello world">hello world</button>
                <button class="mc-sample-btn" data-text="camper crafting">camper crafting</button>
                <button class="mc-sample-btn" data-text="shamper website">shamper website</button>
                <button class="mc-sample-btn" data-text="admin">admin</button>
            </div>
        </div>
    `;
}

function initMiniCaps() {
    const input = document.getElementById("mcInputText");
    const output = document.getElementById("mcOutputBox");
    const count = document.getElementById("mcCharCount");
    const copyBtn = document.getElementById("mcCopyBtn");
    const clearBtn = document.getElementById("mcClearBtn");
    const radios = document.querySelectorAll("input[name='mcMode']");

    let currentConverted = "";

    function update() {
        const text = input ? input.value : "";
        let selectedMode = "normal";
        radios.forEach(r => {
            if (r.checked) selectedMode = r.value;
        });

        if (!text) {
            currentConverted = "";
            if (output) output.innerHTML = `<span class="mc-placeholder">Здесь появится сконвертированный текст...</span>`;
            if (count) count.textContent = `Символов: 0`;
            return;
        }

        currentConverted = convertToSmallCaps(text, selectedMode);
        if (output) output.textContent = currentConverted;
        if (count) count.textContent = `Символов: ${currentConverted.length}`;
    }

    input?.addEventListener("input", update);
    radios.forEach(r => r.addEventListener("change", update));

    clearBtn?.addEventListener("click", () => {
        if (input) {
            input.value = "";
            input.focus();
            update();
        }
    });

    document.querySelectorAll(".mc-sample-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (input) {
                input.value = btn.dataset.text || "";
                update();
            }
        });
    });

    copyBtn?.addEventListener("click", () => {
        if (!currentConverted) return;
        copyToClipboard(currentConverted);
    });

    // Default sample text
    if (input && !input.value) {
        input.value = "shamper crafting";
        update();
    }
}

// ==========================================
// 3. MINECRAFT SERVER PINGER COMPONENT
// ==========================================

function getServerPingerHtml() {
    return `
        <div class="server-pinger-container">
            <div class="sp-search-bar">
                <div class="sp-input-row">
                    <input type="text" id="spServerInput" class="sp-input" placeholder="Введите IP или домен сервера (например: bubblemc.ru)..." value="bubblemc.ru">
                    <button class="sp-ping-btn" id="spPingBtn">Пингануть</button>
                </div>

                <div class="mc-options-row" style="margin-top: 8px;">
                    <span class="mc-options-label">Платформа:</span>
                    <label class="mc-radio-label">
                        <input type="radio" name="spEdition" value="java" checked> Java Edition
                    </label>
                    <label class="mc-radio-label">
                        <input type="radio" name="spEdition" value="bedrock"> Bedrock Edition
                    </label>
                </div>

                <div class="mc-quick-samples" style="margin-top: 10px;">
                    <span class="mc-samples-label">Быстрый выбор:</span>
                    <button class="mc-sample-btn sp-sample-btn" data-ip="bubblemc.ru" data-edition="java">BubbleMC</button>
                    <button class="mc-sample-btn sp-sample-btn" data-ip="beammc.su" data-edition="java">Beam</button>
                    <button class="mc-sample-btn sp-sample-btn" data-ip="play.mccisland.net" data-edition="java">MCC Island</button>
                    <button class="mc-sample-btn sp-sample-btn" data-ip="play.cubecraft.net" data-edition="bedrock">CubeCraft (Bedrock)</button>
                </div>
            </div>

            <div class="sp-result-container" id="spResultArea">
                <div class="sp-loading" id="spLoading" style="display: none;">
                    <div class="sp-spinner"></div>
                    <span>Опрашиваем сервер...</span>
                </div>
                <div id="spResultContent"></div>
            </div>
        </div>
    `;
}

function initServerPinger() {
    const input = document.getElementById("spServerInput");
    const pingBtn = document.getElementById("spPingBtn");
    const loading = document.getElementById("spLoading");
    const resultContent = document.getElementById("spResultContent");
    const sampleBtns = document.querySelectorAll(".sp-sample-btn");
    const editionRadios = document.querySelectorAll("input[name='spEdition']");

    let isFetching = false;

    async function pingServer(targetAddress, edition = "java") {
        if (isFetching) return;
        const address = (targetAddress || (input ? input.value : "")).trim();
        if (!address) return;

        isFetching = true;
        if (loading) loading.style.display = "flex";
        if (resultContent) resultContent.innerHTML = "";

        const apiUrl = edition === "bedrock" 
            ? `https://api.mcsrvstat.us/bedrock/3/${encodeURIComponent(address)}`
            : `https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`;

        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("HTTP error " + res.status);
            const data = await res.json();
            renderServerData(data, address, edition);
        } catch (err) {
            console.error("Pinger error:", err);
            if (resultContent) {
                resultContent.innerHTML = `
                    <div class="sp-error-card">
                        <div class="sp-status-badge offline">Ошибка запроса</div>
                        <p style="margin: 10px 0 0; color: #bbb;">Не удалось связаться с API или получить данные сервера. Проверьте адрес или повторите позже.</p>
                    </div>
                `;
            }
        } finally {
            isFetching = false;
            if (loading) loading.style.display = "none";
        }
    }

    function renderServerData(data, queriedAddress, edition) {
        if (!resultContent) return;

        if (!data || !data.online) {
            resultContent.innerHTML = `
                <div class="sp-card sp-offline-card">
                    <div class="sp-card-header">
                        <img class="sp-server-icon" src="assets/utils/server-pinger/icon.png" alt="Server icon">
                        <div class="sp-card-title-group">
                            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <h2 style="margin:0; font-size:1.4em;">${queriedAddress}</h2>
                                <span class="sp-status-badge offline">Оффлайн</span>
                            </div>
                            <span class="sp-sub-info">Платформа: ${edition === 'bedrock' ? 'Bedrock Edition' : 'Java Edition'}</span>
                        </div>
                    </div>
                    <div class="sp-offline-msg">
                        Сервер выключен, временно недоступен или не отвечает на пинг-запросы по указанному адресу.
                    </div>
                </div>
            `;
            return;
        }

        const iconSrc = data.icon || "assets/utils/server-pinger/icon.png";
        const playersOnline = data.players?.online || 0;
        const playersMax = data.players?.max || 0;
        const percentOnline = playersMax > 0 ? Math.min(100, Math.round((playersOnline / playersMax) * 100)) : 0;
        
        let motdHtml = "";
        if (data.motd?.html?.length) {
            motdHtml = data.motd.html.join("<br>");
        } else if (data.motd?.clean?.length) {
            motdHtml = data.motd.clean.join("<br>");
        } else {
            motdHtml = "<span style='color:#777;'>MOTD отсутствует</span>";
        }

        const serverIpText = `${data.ip || queriedAddress}${data.port ? ':' + data.port : ''}`;

        let playerListHtml = "";
        if (data.players?.list?.length) {
            playerListHtml = `
                <div class="sp-players-section">
                    <span class="sp-section-title">Игроки онлайн (${data.players.list.length}):</span>
                    <div class="sp-players-list">
                        ${data.players.list.map(p => {
                            const name = typeof p === 'string' ? p : (p.name || 'Player');
                            return `<div class="sp-player-chip"><img src="https://mc-heads.net/avatar/${name}/20" class="sp-player-avatar" onerror="this.style.display='none'"><span>${name}</span></div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        resultContent.innerHTML = `
            <div class="sp-card">
                <div class="sp-card-header">
                    <img class="sp-server-icon" src="${iconSrc}" alt="Server Icon">
                    <div class="sp-card-title-group">
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <h2 style="margin:0; font-size:1.4em;">${data.hostname || queriedAddress}</h2>
                            <span class="sp-status-badge online">Онлайн</span>
                            <span class="sp-edition-badge">${edition === 'bedrock' ? 'Bedrock' : 'Java'}</span>
                        </div>
                        <div class="sp-ip-row">
                            <span class="sp-ip-text">${serverIpText}</span>
                            <button class="sp-copy-ip-btn" data-copy="${serverIpText}">Копировать IP</button>
                        </div>
                    </div>
                </div>

                <div class="sp-stats-grid">
                    <div class="sp-stat-box">
                        <span class="sp-stat-label">Онлайн игроков</span>
                        <span class="sp-stat-value">${playersOnline.toLocaleString('ru-RU')} / ${playersMax.toLocaleString('ru-RU')}</span>
                        <div class="sp-progress-bar">
                            <div class="sp-progress-fill" style="width: ${percentOnline}%;"></div>
                        </div>
                    </div>

                    <div class="sp-stat-box">
                        <span class="sp-stat-label">Версия сервера</span>
                        <span class="sp-stat-value">${data.version || 'Не указана'}</span>
                        ${data.software ? `<span class="sp-sub-label">Ядро: ${data.software}</span>` : ''}
                    </div>

                    <div class="sp-stat-box">
                        <span class="sp-stat-label">IP адрес и порт</span>
                        <span class="sp-stat-value">${data.ip || '—'}:${data.port || '25565'}</span>
                        ${data.protocol ? `<span class="sp-sub-label">Протокол: ${data.protocol.name || data.protocol.version || data.protocol}</span>` : ''}
                    </div>
                </div>

                <div class="sp-motd-section">
                    <div class="sp-motd-header">
                        <span class="sp-section-title">MOTD (Описание сервера)</span>
                        <button class="mc-sample-btn" id="spCopyMotdBtn">Скопировать MOTD</button>
                    </div>
                    <div class="sp-motd-box" id="spMotdBox">
                        ${motdHtml}
                    </div>
                </div>

                ${playerListHtml}
            </div>
        `;

        // Bind copy buttons inside results
        const copyIpBtn = resultContent.querySelector(".sp-copy-ip-btn");
        copyIpBtn?.addEventListener("click", () => {
            copyToClipboard(copyIpBtn.dataset.copy);
        });

        const copyMotdBtn = document.getElementById("spCopyMotdBtn");
        copyMotdBtn?.addEventListener("click", () => {
            const cleanMotd = (data.motd?.clean || []).join("\n");
            copyToClipboard(cleanMotd || data.motd?.raw?.join("\n") || "");
        });
    }

    pingBtn?.addEventListener("click", () => {
        let edition = "java";
        editionRadios.forEach(r => { if (r.checked) edition = r.value; });
        pingServer(input?.value, edition);
    });

    input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            let edition = "java";
            editionRadios.forEach(r => { if (r.checked) edition = r.value; });
            pingServer(input?.value, edition);
        }
    });

    sampleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const ip = btn.dataset.ip;
            const ed = btn.dataset.edition || "java";
            if (input) input.value = ip;
            editionRadios.forEach(r => { r.checked = (r.value === ed); });
            pingServer(ip, ed);
        });
    });

    // Auto ping default
    pingServer(input ? input.value : "bubblemc.ru", "java");
}

// ==========================================
// 4. FLAGS GENERATOR COMPONENT
// ==========================================

const FG_FLAGS_OPTIONS = [
    {
        value: "aikar",
        label: "Aikar's Flags (Рекомендуемые)",
        icon: "assets/utils/flags-generator/software/paper.png"
    },
    {
        value: "meowice",
        label: "MeowIce's Flags",
        icon: "assets/utils/flags-generator/flags/meowice.jpg"
    },
    {
        value: "zgc",
        label: "Benchmarked (ZGC, Java 25+)",
        icon: "assets/utils/flags-generator/flags/zgc.svg"
    },
    {
        value: "none",
        label: "None (Без флагов GC)",
        icon: "assets/utils/flags-generator/flags/none.svg"
    }
];

const FG_ENV_OPTIONS = [
    {
        value: "linux",
        label: "Linux (.sh)",
        icon: "assets/utils/flags-generator/env/linux.svg"
    },
    {
        value: "windows",
        label: "Windows (.bat)",
        icon: "assets/utils/flags-generator/env/windows.svg"
    },
    {
        value: "macos",
        label: "MacOS (.command)",
        icon: "assets/utils/flags-generator/env/macos.svg"
    },
    {
        value: "pterodactyl",
        label: "Pterodactyl",
        icon: "assets/utils/flags-generator/env/pterodactyl.svg"
    },
    {
        value: "command",
        label: "Команда (Однострочная)",
        icon: "assets/utils/flags-generator/env/command.svg"
    }
];

const FG_SOFTWARE_OPTIONS = [
    {
        value: "Paper",
        label: "Paper",
        icon: "assets/utils/flags-generator/software/paper.png"
    },
    {
        value: "Purpur",
        label: "Purpur",
        icon: "assets/utils/flags-generator/software/purpur.png"
    },
    {
        value: "Velocity",
        label: "Velocity (Прокси)",
        icon: "assets/utils/flags-generator/software/velocity.png"
    },
    {
        value: "Waterfall",
        label: "Waterfall (Прокси)",
        icon: "assets/utils/flags-generator/software/waterfall.svg"
    },
    {
        value: "NullCordX",
        label: "NullCordX (Прокси)",
        icon: "assets/utils/flags-generator/software/nullcordx.png"
    },
    {
        value: "Spigot",
        label: "Spigot",
        icon: "assets/utils/flags-generator/software/spigot.png"
    },
    {
        value: "Fabric",
        label: "Fabric",
        icon: "assets/utils/flags-generator/software/fabric.png"
    },
    {
        value: "Forge",
        label: "Forge",
        icon: "assets/utils/flags-generator/software/forge.png"
    },
    {
        value: "NeoForge",
        label: "NeoForge",
        icon: "assets/utils/flags-generator/software/neoforge.png"
    }
];

function initCustomDropdown(container, options, initialValue, onChange) {
    if (!container) return { getValue: () => initialValue, setValue: () => {} };

    let currentValue = initialValue || (options[0] ? options[0].value : "");

    function closeAllDropdowns() {
        document.querySelectorAll(".custom-dropdown.open").forEach(d => {
            d.classList.remove("open");
            const parentBox = d.closest(".fg-field-box");
            if (parentBox) parentBox.classList.remove("dropdown-active-box");
        });
    }

    function render() {
        const current = options.find(o => o.value === currentValue) || options[0];
        container.innerHTML = `
            <div class="custom-dropdown">
                <button type="button" class="custom-dropdown-trigger" aria-haspopup="listbox">
                    <div class="custom-dropdown-selected">
                        <img class="custom-dropdown-img" src="${current ? current.icon : ''}" alt="${current ? current.label : ''}">
                        <span class="custom-dropdown-label">${current ? current.label : ''}</span>
                    </div>
                    <svg class="custom-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </button>
                <div class="custom-dropdown-menu">
                    ${options.map(opt => `
                        <div class="custom-dropdown-option ${opt.value === currentValue ? 'selected' : ''}" data-value="${opt.value}">
                            <img class="custom-dropdown-img" src="${opt.icon}" alt="${opt.label}">
                            <span class="custom-dropdown-label">${opt.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const dropdown = container.querySelector(".custom-dropdown");
        const trigger = container.querySelector(".custom-dropdown-trigger");
        const optionEls = container.querySelectorAll(".custom-dropdown-option");
        const parentBox = container.closest(".fg-field-box");

        trigger?.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains("open");
            closeAllDropdowns();
            if (!isOpen) {
                dropdown.classList.add("open");
                if (parentBox) parentBox.classList.add("dropdown-active-box");
            }
        });

        optionEls.forEach(opt => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                const val = opt.dataset.value;
                currentValue = val;
                dropdown.classList.remove("open");
                if (parentBox) parentBox.classList.remove("dropdown-active-box");
                render();
                if (onChange) onChange(val);
            });
        });
    }

    const handleOutsideClick = (e) => {
        if (!container.contains(e.target)) {
            const dropdown = container.querySelector(".custom-dropdown");
            if (dropdown && dropdown.classList.contains("open")) {
                dropdown.classList.remove("open");
                const parentBox = container.closest(".fg-field-box");
                if (parentBox) parentBox.classList.remove("dropdown-active-box");
            }
        }
    };
    window.addEventListener("click", handleOutsideClick);

    render();

    return {
        getValue: () => currentValue,
        setValue: (val) => {
            currentValue = val;
            render();
            if (onChange) onChange(val);
        }
    };
}

function getFlagsGeneratorHtml() {
    return `
        <div class="flags-generator-container">
            <div class="fg-form-grid">
                <!-- 1. Название файла ядра -->
                <div class="fg-field-box">
                    <span class="mc-label">Название файла ядра сервера</span>
                    <input type="text" id="fgJarName" class="sp-input" placeholder="server.jar" value="server.jar">
                </div>

                <!-- 2. Флаги -->
                <div class="fg-field-box">
                    <span class="mc-label">Набор флагов</span>
                    <div id="fgFlagsDropdown"></div>
                </div>

                <!-- 3. Окружение -->
                <div class="fg-field-box">
                    <span class="mc-label">Окружение</span>
                    <div id="fgEnvDropdown"></div>
                </div>

                <!-- 4. Ядро -->
                <div class="fg-field-box">
                    <span class="mc-label">Ядро сервера</span>
                    <div id="fgSoftwareDropdown"></div>
                </div>

                <!-- 5. ОЗУ -->
                <div class="fg-field-box full-width">
                    <div class="mc-label-row">
                        <span class="mc-label">Оперативная память (ОЗУ / RAM)</span>
                        <span class="fg-ram-badge" id="fgRamValue">8 GB (8192 MB)</span>
                    </div>
                    <div class="fg-slider-row">
                        <input type="range" id="fgRamSlider" class="track-time-slider" min="1" max="32" value="8" step="1" style="width: 100%;">
                    </div>
                    <div class="fg-toggle-row">
                        <label class="mc-radio-label">
                            <input type="checkbox" id="fgOverhead" checked>
                            <span style="font-weight: bold; color: #fff;">Рассчитать перегрузку</span>
                        </label>
                        <p class="fg-desc">Рекомендуется для предотвращения Out Of Memory (OOM) ошибок. Формула: <code>11x ÷ 12 - 1200 МБ</code>, где <code>x</code> — объем RAM.</p>
                        <div class="fg-calc-preview" id="fgCalcPreview">Выделенная RAM: 8192 MB &rarr; Heap (Куча Java): 6309 MB</div>
                    </div>
                </div>

                <!-- 6. Конфигурация -->
                <div class="fg-field-box full-width">
                    <span class="mc-label">Конфигурация</span>
                    <div class="fg-checkboxes-list">
                        <div class="fg-toggle-item">
                            <label class="mc-radio-label">
                                <input type="checkbox" id="fgNoGui" checked>
                                <span style="font-weight: bold; color: #fff;">Без GUI</span>
                            </label>
                            <p class="fg-desc">Отключает встроенное графическое окно сервера (флаг <code>--nogui</code>) для экономии ресурсов.</p>
                        </div>

                        <div class="fg-toggle-item" id="fgUseVarsWrapper">
                            <label class="mc-radio-label">
                                <input type="checkbox" id="fgUseVars" checked>
                                <span style="font-weight: bold; color: #fff;">Использовать переменные</span>
                            </label>
                            <p class="fg-desc">Использовать переменные внутри скрипта (RAM, JAR_NAME, FLAGS) для более удобного редактирования.</p>
                        </div>

                        <div class="fg-toggle-item" id="fgAutoRestartWrapper">
                            <label class="mc-radio-label">
                                <input type="checkbox" id="fgAutoRestart" checked>
                                <span style="font-weight: bold; color: #fff;">Авто-перезапуск</span>
                            </label>
                            <p class="fg-desc">Автоматически перезапускать сервер после его остановки или падения.</p>
                        </div>

                        <div class="fg-toggle-item" id="fgGraalVmWrapper" style="display: none;">
                            <label class="mc-radio-label">
                                <input type="checkbox" id="fgGraalVm">
                                <span style="font-weight: bold; color: #a771da;">MeowIce's Flags (GraalVM)</span>
                            </label>
                            <p class="fg-desc">Дополнительные флаги оптимизации исключительно для пользователей GraalVM JDK.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 7. Вывод (Output) -->
            <div class="fg-output-section">
                <div class="mc-label-row">
                    <div style="display:flex; align-items:center; gap: 8px;">
                        <span class="mc-label">Сгенерированный скрипт / команда</span>
                        <span class="fg-filename-badge" id="fgFilenameBadge">start.sh</span>
                    </div>
                    <div style="display:flex; gap: 8px;">
                        <button class="mc-sample-btn" id="fgDownloadBtn">Скачать файл</button>
                        <button class="mc-sample-btn" id="fgCopyBtn" style="background: black; border-color: rgba(255,255,255,0.2); color: #fff;">Копировать</button>
                    </div>
                </div>
                <pre class="fg-output-box" id="fgOutputBox"><code></code></pre>
            </div>
        </div>
    `;
}

function initFlagsGenerator() {
    const jarInput = document.getElementById("fgJarName");
    const ramSlider = document.getElementById("fgRamSlider");
    const ramValue = document.getElementById("fgRamValue");
    const overheadCheck = document.getElementById("fgOverhead");
    const calcPreview = document.getElementById("fgCalcPreview");
    const noGuiCheck = document.getElementById("fgNoGui");
    const useVarsCheck = document.getElementById("fgUseVars");
    const autoRestartCheck = document.getElementById("fgAutoRestart");
    const graalVmCheck = document.getElementById("fgGraalVm");
    const graalVmWrapper = document.getElementById("fgGraalVmWrapper");
    const useVarsWrapper = document.getElementById("fgUseVarsWrapper");
    const autoRestartWrapper = document.getElementById("fgAutoRestartWrapper");
    const outputBox = document.getElementById("fgOutputBox");
    const filenameBadge = document.getElementById("fgFilenameBadge");
    const copyBtn = document.getElementById("fgCopyBtn");
    const downloadBtn = document.getElementById("fgDownloadBtn");

    const flagsDropdownContainer = document.getElementById("fgFlagsDropdown");
    const envDropdownContainer = document.getElementById("fgEnvDropdown");
    const softDropdownContainer = document.getElementById("fgSoftwareDropdown");

    let flagsDropdown, envDropdown, softDropdown;

    let currentScript = "";
    let currentFileName = "start.sh";

    function calculateHeap(ramGb) {
        const totalMb = ramGb * 1024;
        const calculated = Math.floor((11 * totalMb / 12) - 1200);
        return Math.max(512, calculated);
    }

    function getFlagsString(flagsType, ramGb, software, isGraalVm) {
        const isProxy = (software === "Waterfall" || software === "NullCordX" || software === "Velocity");

        if (flagsType === "none") {
            return "";
        }

        if (flagsType === "zgc") {
            return "-XX:+UseZGC -XX:+ZGenerational -XX:+AlwaysPreTouch -XX:+PerfDisableSharedMem -XX:+UnlockExperimentalVMOptions -XX:+UnlockDiagnosticVMOptions -XX:ZAllocationSpikeTolerance=5 -XX:ZCollectionInterval=120";
        }

        if (flagsType === "meowice") {
            let flags = "-XX:+AlwaysPreTouch -XX:+DisableExplicitGC -XX:+ParallelRefProcEnabled -XX:+PerfDisableSharedMem -XX:+UnlockExperimentalVMOptions -XX:G1HeapRegionSize=16M -XX:G1HeapWastePercent=5 -XX:G1MaxNewSizePercent=50 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1NewSizePercent=35 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:G1ReservePercent=15 -XX:InitiatingHeapOccupancyPercent=20 -XX:MaxGCPauseMillis=200 -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32";
            if (isGraalVm) {
                flags += " -Dgraal.CompilerConfiguration=community -Dgraal.TuneInlinerExploration=1 -Dgraal.LoopInversion=true -Dgraal.VectorizeSIMD=true";
            }
            return flags;
        }

        if (flagsType === "aikar") {
            if (isProxy) {
                return "-XX:+AlwaysPreTouch -XX:+ParallelRefProcEnabled -XX:+UnlockExperimentalVMOptions -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true";
            }

            if (ramGb > 12) {
                return "-XX:+AlwaysPreTouch -XX:+DisableExplicitGC -XX:+ParallelRefProcEnabled -XX:+PerfDisableSharedMem -XX:+UnlockExperimentalVMOptions -XX:G1HeapRegionSize=16M -XX:G1HeapWastePercent=5 -XX:G1MaxNewSizePercent=50 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1NewSizePercent=40 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:G1ReservePercent=15 -XX:InitiatingHeapOccupancyPercent=20 -XX:MaxGCPauseMillis=200 -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true";
            } else {
                return "-XX:+AlwaysPreTouch -XX:+DisableExplicitGC -XX:+ParallelRefProcEnabled -XX:+PerfDisableSharedMem -XX:+UnlockExperimentalVMOptions -XX:G1HeapRegionSize=8M -XX:G1HeapWastePercent=5 -XX:G1MaxNewSizePercent=40 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1NewSizePercent=30 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15 -XX:MaxGCPauseMillis=200 -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true";
            }
        }

        return "";
    }

    function update() {
        const jarName = (jarInput?.value || "server.jar").trim();
        const flagsType = flagsDropdown ? flagsDropdown.getValue() : "aikar";
        const env = envDropdown ? envDropdown.getValue() : "linux";
        const software = softDropdown ? softDropdown.getValue() : "Paper";
        const ramGb = parseInt(ramSlider?.value || "8", 10);
        const useOverhead = overheadCheck?.checked || false;
        const noGui = noGuiCheck?.checked || false;
        const useVars = useVarsCheck?.checked || false;
        const autoRestart = autoRestartCheck?.checked || false;
        const isGraalVm = graalVmCheck?.checked || false;

        // Toggle GraalVM visibility
        if (graalVmWrapper) {
            graalVmWrapper.style.display = (flagsType === "meowice") ? "block" : "none";
        }

        // Toggle script helpers visibility (Pterodactyl & Raw command don't need useVars or loop)
        const isScript = (env === "linux" || env === "windows" || env === "macos");
        if (useVarsWrapper) useVarsWrapper.style.display = isScript ? "block" : "none";
        if (autoRestartWrapper) autoRestartWrapper.style.display = isScript ? "block" : "none";

        // Update RAM displays
        const totalMb = ramGb * 1024;
        if (ramValue) ramValue.textContent = `${ramGb} GB (${totalMb} MB)`;

        const heapMb = calculateHeap(ramGb);
        if (calcPreview) {
            if (useOverhead) {
                calcPreview.innerHTML = `Выделенная RAM: <b>${totalMb} MB</b> &rarr; Heap (Куча Java): <b style="color:#a771da;">${heapMb} MB</b> (Оверхед: ${totalMb - heapMb} MB)`;
            } else {
                calcPreview.innerHTML = `Выделенная RAM: <b>${totalMb} MB</b> &rarr; Heap (Куча Java): <b style="color:#a771da;">${ramGb} GB (${totalMb} MB)</b> (Оверхед выключен)`;
            }
        }

        const ramStr = useOverhead ? `${heapMb}M` : `${ramGb}G`;
        const flagsStr = getFlagsString(flagsType, ramGb, software, isGraalVm);
        const flagsClean = flagsStr ? " " + flagsStr : "";

        const isProxy = (software === "Waterfall" || software === "NullCordX" || software === "Velocity");
        const noGuiArg = (!isProxy && noGui) ? " --nogui" : "";

        // Determine filename
        if (env === "linux") currentFileName = "start.sh";
        else if (env === "windows") currentFileName = "start.bat";
        else if (env === "macos") currentFileName = "start.command";
        else if (env === "pterodactyl") currentFileName = "Startup Command";
        else currentFileName = "command.txt";

        if (filenameBadge) filenameBadge.textContent = currentFileName;

        // Generate script content
        if (env === "linux") {
            if (useVars) {
                currentScript = `#!/usr/bin/env bash
# Minecraft Server Startup Script
JAR_NAME="${jarName}"
RAM="${ramStr}"
FLAGS="${flagsStr}"

${autoRestart ? `while true; do
    echo "Запуск Minecraft сервера..."
    java -Xms$RAM -Xmx$RAM $FLAGS -jar $JAR_NAME${noGuiArg}
    echo "Сервер остановлен. Перезапуск через 5 секунд (Нажмите Ctrl+C для отмены)..."
    sleep 5
done` : `java -Xms$RAM -Xmx$RAM $FLAGS -jar $JAR_NAME${noGuiArg}`}`;
            } else {
                currentScript = `#!/usr/bin/env bash
# Minecraft Server Startup Script
${autoRestart ? `while true; do
    echo "Запуск Minecraft сервера..."
    java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}
    echo "Сервер остановлен. Перезапуск через 5 секунд (Нажмите Ctrl+C для отмены)..."
    sleep 5
done` : `java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}`}`;
            }
        } else if (env === "windows") {
            if (useVars) {
                currentScript = `@echo off
title Minecraft Server
set JAR_NAME=${jarName}
set RAM=${ramStr}
set FLAGS=${flagsStr}

${autoRestart ? `:start
echo Запуск Minecraft сервера...
java -Xms%RAM% -Xmx%RAM% %FLAGS% -jar %JAR_NAME%${noGuiArg}
echo Сервер остановлен. Перезапуск через 5 секунд (Нажмите Ctrl+C для отмены)...
timeout /t 5 /nobreak >nul
goto start` : `java -Xms%RAM% -Xmx%RAM% %FLAGS% -jar %JAR_NAME%${noGuiArg}
pause`}`;
            } else {
                currentScript = `@echo off
title Minecraft Server
${autoRestart ? `:start
echo Запуск Minecraft сервера...
java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}
echo Сервер остановлен. Перезапуск через 5 секунд (Нажмите Ctrl+C для отмены)...
timeout /t 5 /nobreak >nul
goto start` : `java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}
pause`}`;
            }
        } else if (env === "macos") {
            currentScript = `#!/usr/bin/env bash
cd "$(dirname "$0")"
# Minecraft Server Startup Script
${autoRestart ? `while true; do
    echo "Запуск Minecraft сервера..."
    java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}
    echo "Сервер остановлен. Перезапуск через 5 секунд..."
    sleep 5
done` : `java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}`}`;
        } else if (env === "pterodactyl") {
            const pterodactylRam = useOverhead ? `${heapMb}M` : `{{SERVER_MEMORY}}M`;
            currentScript = `java -Xms${pterodactylRam} -Xmx${pterodactylRam}${flagsClean} -jar {{SERVER_JARFILE}}${noGuiArg}`;
        } else {
            currentScript = `java -Xms${ramStr} -Xmx${ramStr}${flagsClean} -jar ${jarName}${noGuiArg}`;
        }

        if (outputBox) {
            outputBox.querySelector("code").textContent = currentScript;
        }
    }

    // Initialize custom dropdowns
    flagsDropdown = initCustomDropdown(flagsDropdownContainer, FG_FLAGS_OPTIONS, "aikar", update);
    envDropdown = initCustomDropdown(envDropdownContainer, FG_ENV_OPTIONS, "linux", update);
    softDropdown = initCustomDropdown(softDropdownContainer, FG_SOFTWARE_OPTIONS, "Paper", update);

    // Event listeners
    jarInput?.addEventListener("input", update);
    ramSlider?.addEventListener("input", update);
    overheadCheck?.addEventListener("change", update);
    noGuiCheck?.addEventListener("change", update);
    useVarsCheck?.addEventListener("change", update);
    autoRestartCheck?.addEventListener("change", update);
    graalVmCheck?.addEventListener("change", update);

    copyBtn?.addEventListener("click", () => {
        if (!currentScript) return;
        copyToClipboard(currentScript);
    });

    downloadBtn?.addEventListener("click", () => {
        if (!currentScript) return;
        const blob = new Blob([currentScript], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentFileName === "Startup Command" ? "startup.txt" : currentFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Файл скачан!");
    });

    // Initial render
    update();
}

// Global initialization helper
async function initUtils() {
    if (!window.utilsLoaded) {
        await loadUtils();
        window.utilsLoaded = true;
    }
    renderUtils();
}

window.loadUtils = loadUtils;
window.utilsMap = utilsMap;
window.initUtils = initUtils;
window.renderUtils = renderUtils;
window.openUtilModal = openUtilModal;
window.closeModal = closeModal;
