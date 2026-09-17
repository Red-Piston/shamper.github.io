const utilsMap = new Map();
const UTILS_PER_PAGE = 4;
let currentUtilsPage = 1;

async function loadUtils() {
    const files = ["color-picker.yml", "mini-caps.yml", "server-pinger.yml", "flags-generator.yml"];
    //  "translator.yml", "qr-studio.yml"

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
    } else if (util.id === "translator") {
        componentHtml = getTranslatorHtml();
    } else if (util.id === "qr-studio") {
        componentHtml = getQrStudioHtml();
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
    } else if (util.id === "translator") {
        initTranslator();
    } else if (util.id === "qr-studio") {
        initQrStudio();
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

    let currentValue = initialValue !== undefined ? initialValue : (options[0] ? options[0].value : "");

    function closeAllDropdowns() {
        document.querySelectorAll(".custom-dropdown.open").forEach(d => {
            d.classList.remove("open");
        });
        document.querySelectorAll(".qr-color-popover-trigger.open").forEach(p => {
            p.classList.remove("open");
        });
        document.querySelectorAll(".dropdown-active-box").forEach(b => {
            b.classList.remove("dropdown-active-box");
        });
    }

    function render() {
        const current = options.find(o => String(o.value) === String(currentValue)) || options[0];
        container.innerHTML = `
            <div class="custom-dropdown">
                <button type="button" class="custom-dropdown-trigger" aria-haspopup="listbox">
                    <div class="custom-dropdown-selected">
                        ${current && current.icon ? `<img class="custom-dropdown-img" src="${current.icon}" alt="${current.label}">` : ''}
                        <span class="custom-dropdown-label">${current ? current.label : ''}</span>
                    </div>
                    <svg class="custom-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </button>
                <div class="custom-dropdown-menu">
                    ${options.map(opt => `
                        <div class="custom-dropdown-option ${String(opt.value) === String(currentValue) ? 'selected' : ''}" data-value="${opt.value}">
                            ${opt.icon ? `<img class="custom-dropdown-img" src="${opt.icon}" alt="${opt.label}">` : ''}
                            <span class="custom-dropdown-label">${opt.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const dropdown = container.querySelector(".custom-dropdown");
        const trigger = container.querySelector(".custom-dropdown-trigger");
        const optionEls = container.querySelectorAll(".custom-dropdown-option");

        trigger?.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains("open");
            closeAllDropdowns();
            if (!isOpen) {
                dropdown.classList.add("open");
                container.closest(".qr-card-section, .fg-field-box")?.classList.add("dropdown-active-box");
                container.closest(".qr-field-group")?.classList.add("dropdown-active-box");
                container.closest(".qr-field-row")?.classList.add("dropdown-active-box");
            }
        });

        optionEls.forEach(opt => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                const val = opt.dataset.value;
                currentValue = val;
                closeAllDropdowns();
                render();
                if (onChange) onChange(val);
            });
        });
        const handleOutsideClick = (e) => {
            if (!container.contains(e.target)) {
                const dropdown = container.querySelector(".custom-dropdown");
                if (dropdown && dropdown.classList.contains("open")) {
                    closeAllDropdowns();
                }
            }
        };
        window.addEventListener("click", handleOutsideClick);
    }

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

// ==========================================
// 5. TRANSLATOR COMPONENT
// ==========================================

const TR_PROVIDER_OPTIONS = [
    {
        value: "google",
        label: "Google",
        icon: "assets/utils/translator/providers/google.webp"
    },
    {
        value: "yandex",
        label: "Yandex",
        icon: "assets/utils/translator/providers/yandex.png"
    },
    {
        value: "deepl",
        label: "DeepL",
        icon: "assets/utils/translator/providers/deepl.webp"
    },
    {
        value: "reverso",
        label: "Reverso",
        icon: "assets/utils/translator/providers/reverso.png"
    }
];

const TR_PROVIDER_LANGUAGES = {
    google: ["ru", "en", "de", "fr", "es", "it", "zh", "ja", "ko", "tr", "uk", "pl", "pt", "nl", "ar", "cs", "sv", "el", "he", "hi", "vi", "id", "fi", "no", "da", "ro", "hu", "bg", "sr", "kk", "uz", "be"],
    yandex: ["ru", "en", "de", "fr", "es", "it", "zh", "ja", "ko", "tr", "uk", "pl", "pt", "nl", "ar", "cs", "sv", "el", "he", "hi", "vi", "id", "fi", "no", "da", "ro", "hu", "bg", "sr", "kk", "uz", "be"],
    deepl: ["ru", "en", "de", "fr", "es", "it", "zh", "ja", "ko", "tr", "uk", "pl", "pt", "nl", "cs", "sv", "el", "id", "fi", "no", "da", "ro", "hu", "bg"],
    reverso: ["ru", "en", "de", "fr", "es", "it", "zh", "ja", "tr", "pl", "pt", "nl", "ar", "he", "ro"]
};

const TR_LANGUAGES = [
    { code: "ru", name: "Русский", voice: "ru-RU", flag: "🇷🇺" },
    { code: "en", name: "Английский", voice: "en-US", flag: "🇬🇧" },
    { code: "de", name: "Немецкий", voice: "de-DE", flag: "🇩🇪" },
    { code: "fr", name: "Французский", voice: "fr-FR", flag: "🇫🇷" },
    { code: "es", name: "Испанский", voice: "es-ES", flag: "🇪🇸" },
    { code: "it", name: "Итальянский", voice: "it-IT", flag: "🇮🇹" },
    { code: "zh", name: "Китайский", voice: "zh-CN", flag: "🇨🇳" },
    { code: "ja", name: "Японский", voice: "ja-JP", flag: "🇯🇵" },
    { code: "ko", name: "Корейский", voice: "ko-KR", flag: "🇰🇷" },
    { code: "tr", name: "Турецкий", voice: "tr-TR", flag: "🇹🇷" },
    { code: "uk", name: "Украинский", voice: "uk-UA", flag: "🇺🇦" },
    { code: "pl", name: "Польский", voice: "pl-PL", flag: "🇵🇱" },
    { code: "pt", name: "Португальский", voice: "pt-PT", flag: "🇵🇹" },
    { code: "nl", name: "Нидерландский", voice: "nl-NL", flag: "🇳🇱" },
    { code: "ar", name: "Арабский", voice: "ar-SA", flag: "🇸🇦" },
    { code: "cs", name: "Чешский", voice: "cs-CZ", flag: "🇨🇿" },
    { code: "sv", name: "Шведский", voice: "sv-SE", flag: "🇸🇪" },
    { code: "el", name: "Греческий", voice: "el-GR", flag: "🇬🇷" },
    { code: "he", name: "Иврит", voice: "he-IL", flag: "🇮🇱" },
    { code: "hi", name: "Хинди", voice: "hi-IN", flag: "🇮🇳" },
    { code: "vi", name: "Вьетнамский", voice: "vi-VN", flag: "🇻🇳" },
    { code: "id", name: "Индонезийский", voice: "id-ID", flag: "🇮🇩" },
    { code: "fi", name: "Финский", voice: "fi-FI", flag: "🇫🇮" },
    { code: "no", name: "Норвежский", voice: "nb-NO", flag: "🇳🇴" },
    { code: "da", name: "Датский", voice: "da-DK", flag: "🇩🇰" },
    { code: "ro", name: "Румынский", voice: "ro-RO", flag: "🇷🇴" },
    { code: "hu", name: "Венгерский", voice: "hu-HU", flag: "🇭🇺" },
    { code: "bg", name: "Болгарский", voice: "bg-BG", flag: "🇧🇬" },
    { code: "sr", name: "Сербский", voice: "sr-RS", flag: "🇷🇸" },
    { code: "kk", name: "Казахский", voice: "kk-KZ", flag: "🇰🇿" },
    { code: "uz", name: "Узбекский", voice: "uz-UZ", flag: "🇺🇿" },
    { code: "be", name: "Белорусский", voice: "be-BY", flag: "🇧🇾" }
];

const POS_TRANSLATIONS = {
    noun: "Существительное (Noun)",
    verb: "Глагол (Verb)",
    adjective: "Прилагательное (Adjective)",
    adverb: "Наречие (Adverb)",
    pronoun: "Местоимение",
    preposition: "Предлог",
    conjunction: "Союз",
    interjection: "Междометие",
    phrase: "Фраза",
    abbreviation: "Сокращение"
};

function initLanguageDropdown(container, isSource, initialValue, onChange) {
    if (!container) return { getValue: () => initialValue, setValue: () => {} };

    let currentValue = initialValue;
    const allOptions = isSource
        ? [{ code: "auto", name: "Определить язык", flag: "✨" }, ...TR_LANGUAGES]
        : [...TR_LANGUAGES];

    function closeAllDropdowns() {
        document.querySelectorAll(".custom-dropdown.open").forEach(d => {
            d.classList.remove("open");
            const parent = d.closest(".fg-field-box, .tr-top-bar, .tr-panel, .tr-main-wrapper");
            if (parent) parent.classList.remove("dropdown-active-box");
        });
    }

    function render(searchTerm = "") {
        const current = allOptions.find(o => o.code === currentValue) || allOptions[0];
        const filtered = searchTerm
            ? allOptions.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.code.toLowerCase().includes(searchTerm.toLowerCase()))
            : allOptions;

        container.innerHTML = `
            <div class="custom-dropdown custom-lang-dropdown">
                <button type="button" class="custom-dropdown-trigger tr-lang-dropdown-trigger" aria-haspopup="listbox">
                    <div class="custom-dropdown-selected">
                        <span class="tr-flag-emoji">${current.flag}</span>
                        <span class="custom-dropdown-label">${current.name}</span>
                    </div>
                    <svg class="custom-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </button>
                <div class="custom-dropdown-menu custom-lang-menu">
                    <div class="tr-lang-search-wrapper">
                        <input type="text" class="tr-lang-search-input" placeholder="Поиск языка..." value="${searchTerm}">
                    </div>
                    <div class="tr-lang-grid-3col">
                        ${filtered.map(opt => `
                            <div class="custom-dropdown-option tr-lang-option ${opt.code === currentValue ? 'selected' : ''}" data-value="${opt.code}">
                                <span class="tr-flag-emoji">${opt.flag}</span>
                                <span class="custom-dropdown-label">${opt.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const dropdown = container.querySelector(".custom-dropdown");
        const trigger = container.querySelector(".custom-dropdown-trigger");
        const searchInput = container.querySelector(".tr-lang-search-input");
        const parentPanel = container.closest(".tr-panel");
        const parentWrapper = container.closest(".tr-main-wrapper");

        trigger?.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains("open");
            closeAllDropdowns();
            if (!isOpen) {
                dropdown.classList.add("open");
                if (parentPanel) parentPanel.classList.add("dropdown-active-box");
                if (parentWrapper) parentWrapper.classList.add("dropdown-active-box");
                setTimeout(() => searchInput?.focus(), 50);
            }
        });

        searchInput?.addEventListener("click", (e) => e.stopPropagation());
        searchInput?.addEventListener("input", (e) => {
            const val = e.target.value;
            const grid = container.querySelector(".tr-lang-grid-3col");
            const newFiltered = val
                ? allOptions.filter(o => o.name.toLowerCase().includes(val.toLowerCase()) || o.code.toLowerCase().includes(val.toLowerCase()))
                : allOptions;
            if (grid) {
                grid.innerHTML = newFiltered.map(opt => `
                    <div class="custom-dropdown-option tr-lang-option ${opt.code === currentValue ? 'selected' : ''}" data-value="${opt.code}">
                        <span class="tr-flag-emoji">${opt.flag}</span>
                        <span class="custom-dropdown-label">${opt.name}</span>
                    </div>
                `).join('');
                bindOptions(grid);
            }
        });

        function bindOptions(parentEl) {
            parentEl.querySelectorAll(".tr-lang-option").forEach(opt => {
                opt.addEventListener("click", (e) => {
                    e.stopPropagation();
                    currentValue = opt.dataset.value;
                    dropdown.classList.remove("open");
                    if (parentPanel) parentPanel.classList.remove("dropdown-active-box");
                    if (parentWrapper) parentWrapper.classList.remove("dropdown-active-box");
                    render();
                    if (onChange) onChange(currentValue);
                });
            });
        }

        bindOptions(container);
    }

    const handleOutsideClick = (e) => {
        if (!container.contains(e.target)) {
            const dropdown = container.querySelector(".custom-dropdown");
            if (dropdown && dropdown.classList.contains("open")) {
                dropdown.classList.remove("open");
                const parentPanel = container.closest(".tr-panel");
                const parentWrapper = container.closest(".tr-main-wrapper");
                if (parentPanel) parentPanel.classList.remove("dropdown-active-box");
                if (parentWrapper) parentWrapper.classList.remove("dropdown-active-box");
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

function getTranslatorHtml() {
    return `
        <div class="translator-container">
            <!-- Top Controls Row -->
            <div class="tr-top-bar">
                <div class="tr-provider-box">
                    <span class="tr-label">Провайдер:</span>
                    <div id="trProviderDropdown" class="tr-custom-dropdown-container"></div>
                </div>
                <div class="tr-status-badge" id="trStatusBadge">
                    <span class="tr-status-dot"></span>
                    <span id="trStatusText">Готов к переводу</span>
                </div>
            </div>

            <!-- Main Translation Box (Google Translate Layout) -->
            <div class="tr-main-wrapper">
                <!-- Source Panel -->
                <div class="tr-panel tr-source-panel">
                    <div class="tr-lang-header">
                        <div id="trSourceLangContainer" class="tr-lang-dropdown-box"></div>
                    </div>

                    <div class="tr-input-box">
                        <textarea
                            id="trSourceInput"
                            class="tr-textarea"
                            placeholder="Введите текст для перевода..."
                            maxlength="5000"
                            spellcheck="false"
                        ></textarea>
                    </div>

                    <div class="tr-toolbar">
                        <div class="tr-toolbar-left">
                            <button type="button" class="tr-tool-btn" id="trClearBtn" title="Очистить текст" style="display:none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            <button type="button" class="tr-tool-btn" id="trSourceTtsBtn" title="Прослушать оригинал" style="display:none;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="tr-toolbar-right">
                            <span class="tr-char-count" id="trCharCount">0 / 5000</span>
                            <button type="button" class="tr-tool-btn" id="trSourceCopyBtn" title="Копировать оригинал" style="display:none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Swap Button -->
                <div class="tr-swap-col">
                    <button type="button" class="tr-swap-btn" id="trSwapLangBtn" title="Поменять языки местами">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                        </svg>
                    </button>
                </div>

                <!-- Target Panel -->
                <div class="tr-panel tr-target-panel">
                    <div class="tr-lang-header">
                        <div id="trTargetLangContainer" class="tr-lang-dropdown-box"></div>
                    </div>

                    <div class="tr-output-box" id="trOutputBox">
                        <div class="tr-output-placeholder" id="trPlaceholder">Здесь появится перевод...</div>
                        <div class="tr-output-text" id="trOutputText" style="display:none;"></div>
                    </div>

                    <div class="tr-toolbar">
                        <div class="tr-toolbar-left">
                            <button type="button" class="tr-tool-btn" id="trTargetTtsBtn" title="Прослушать перевод" style="display:none;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="tr-toolbar-right">
                            <button type="button" class="tr-tool-btn" id="trTargetCopyBtn" title="Копировать перевод" style="display:none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dictionary & Alternative Translations Section -->
            <div class="tr-dict-section" id="trDictSection" style="display:none;">
                <div class="tr-dict-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#a771da">
                        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                    </svg>
                    <span>Словарь и варианты перевода</span>
                </div>
                <div class="tr-dict-content" id="trDictContent"></div>
            </div>
        </div>
    `;
}

function initTranslator() {
    let currentProvider = "google";
    let sourceLang = "auto";
    let targetLang = "ru";
    let lastDetectedLang = "ru";
    let debounceTimer = null;
    let currentTranslation = "";

    const providerContainer = document.getElementById("trProviderDropdown");
    const statusBadge = document.getElementById("trStatusBadge");
    const statusText = document.getElementById("trStatusText");

    const sourceLangContainer = document.getElementById("trSourceLangContainer");
    const targetLangContainer = document.getElementById("trTargetLangContainer");

    const sourceInput = document.getElementById("trSourceInput");
    const outputBox = document.getElementById("trOutputBox");
    const outputText = document.getElementById("trOutputText");
    const placeholder = document.getElementById("trPlaceholder");
    const charCount = document.getElementById("trCharCount");
    const swapBtn = document.getElementById("trSwapLangBtn");

    const clearBtn = document.getElementById("trClearBtn");
    const sourceTtsBtn = document.getElementById("trSourceTtsBtn");
    const sourceCopyBtn = document.getElementById("trSourceCopyBtn");
    const targetTtsBtn = document.getElementById("trTargetTtsBtn");
    const targetCopyBtn = document.getElementById("trTargetCopyBtn");

    const dictSection = document.getElementById("trDictSection");
    const dictContent = document.getElementById("trDictContent");

    let sourceDropdownCtrl = null;
    let targetDropdownCtrl = null;

    // Helper: Find voice code for language
    function getVoiceCode(lang) {
        const item = TR_LANGUAGES.find(l => l.code === lang);
        return item ? item.voice : (lang === "ru" ? "ru-RU" : "en-US");
    }

    // Helper: Detect language from text characters if auto
    function inferLangFromText(text) {
        if (!text) return "ru";
        if (/[а-яё]/i.test(text)) return "ru";
        if (/[\u4e00-\u9fff]/.test(text)) return "zh";
        if (/[\u3040-\u30ff]/.test(text)) return "ja";
        if (/[\uac00-\ud7af]/.test(text)) return "ko";
        if (/[\u0600-\u06ff]/.test(text)) return "ar";
        if (/[\u0590-\u05ff]/.test(text)) return "he";
        if (/[a-z]/i.test(text)) return "en";
        return lastDetectedLang || "en";
    }

    // TTS speech helper
    function playTts(text, langCode, btnEl) {
        if (!window.speechSynthesis || !text) return;
        
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        } catch (e) {}

        const resolvedLang = langCode === "auto" ? inferLangFromText(text) : langCode;
        const voiceCode = getVoiceCode(resolvedLang);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceCode;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
            const match = voices.find(v => v.lang === voiceCode) || 
                          voices.find(v => v.lang.replace('_', '-').startsWith(voiceCode.slice(0, 2)));
            if (match) utterance.voice = match;
        }

        btnEl?.classList.add("playing");
        utterance.onend = () => btnEl?.classList.remove("playing");
        utterance.onerror = () => btnEl?.classList.remove("playing");

        window.speechSynthesis.speak(utterance);
    }

    // Preload voices
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }

    // Update Status
    function setStatus(type, msg) {
        if (!statusBadge || !statusText) return;
        statusBadge.className = `tr-status-badge ${type}`;
        statusText.textContent = msg;
    }

    // Initialize custom dropdowns
    initCustomDropdown(providerContainer, TR_PROVIDER_OPTIONS, "google", (val) => {
        currentProvider = val;
        // Check provider supported languages, fallback to english if target language is unsupported
        const supported = TR_PROVIDER_LANGUAGES[currentProvider] || TR_PROVIDER_LANGUAGES.google;
        if (!supported.includes(targetLang)) {
            targetLang = "en";
            targetDropdownCtrl?.setValue("en");
            showToast(`Язык автоматически переключен на Английский для ${val}`);
        }
        triggerTranslate(true);
    });

    sourceDropdownCtrl = initLanguageDropdown(sourceLangContainer, true, "auto", (val) => {
        sourceLang = val;
        triggerTranslate(true);
    });

    targetDropdownCtrl = initLanguageDropdown(targetLangContainer, false, "ru", (val) => {
        targetLang = val;
        triggerTranslate(true);
    });

    swapBtn?.addEventListener("click", () => {
        let newSource = targetLang;
        let newTarget = sourceLang === "auto" ? (lastDetectedLang || "en") : sourceLang;

        const currentTargetText = currentTranslation;

        sourceLang = newSource;
        targetLang = newTarget;

        sourceDropdownCtrl?.setValue(newSource);
        targetDropdownCtrl?.setValue(newTarget);

        if (currentTargetText) {
            sourceInput.value = currentTargetText;
            charCount.textContent = `${currentTargetText.length} / 5000`;
            clearBtn.style.display = "inline-flex";
            sourceTtsBtn.style.display = "inline-flex";
            sourceCopyBtn.style.display = "inline-flex";
        }

        if (sourceInput.value.trim()) {
            triggerTranslate(true);
        }
    });

    // Translation logic
    async function doTranslate() {
        const text = sourceInput.value.trim();
        if (!text) {
            currentTranslation = "";
            outputText.textContent = "";
            outputText.style.display = "none";
            placeholder.style.display = "block";
            targetTtsBtn.style.display = "none";
            targetCopyBtn.style.display = "none";
            dictSection.style.display = "none";
            setStatus("ready", "Готов к переводу");
            return;
        }

        setStatus("loading", "Выполняется перевод...");

        try {
            const sl = sourceLang;
            const tl = targetLang;

            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("HTTP error " + res.status);
            const data = await res.json();

            // Process translated text
            let translated = "";
            if (data && data[0]) {
                translated = data[0].map(item => item[0] || "").join("");
            }

            // Save detected source language if available
            if (data && data[2]) {
                lastDetectedLang = data[2];
            } else if (data && data[8] && data[8][0] && data[8][0][0]) {
                lastDetectedLang = data[8][0][0];
            }

            currentTranslation = translated;
            outputText.textContent = translated;
            outputText.style.display = "block";
            placeholder.style.display = "none";
            targetTtsBtn.style.display = "inline-flex";
            targetCopyBtn.style.display = "inline-flex";

            // Process dictionary / parts of speech (noun, verb, etc.)
            const dict = data && data[1] ? data[1] : null;
            renderDictionary(dict);

            const providerLabel = TR_PROVIDER_OPTIONS.find(p => p.value === currentProvider)?.label || "Google Translate";
            setStatus("success", "Переведено через " + providerLabel);
        } catch (err) {
            console.error("Translation error:", err);
            // Fallback to MyMemory API
            try {
                const sl = sourceLang === 'auto' ? inferLangFromText(text) : sourceLang;
                const tl = targetLang;
                const fbUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
                const fbRes = await fetch(fbUrl);
                const fbData = await fbRes.json();
                const translated = fbData?.responseData?.translatedText || "";

                if (translated) {
                    currentTranslation = translated;
                    outputText.textContent = translated;
                    outputText.style.display = "block";
                    placeholder.style.display = "none";
                    targetTtsBtn.style.display = "inline-flex";
                    targetCopyBtn.style.display = "inline-flex";
                    dictSection.style.display = "none";
                    setStatus("success", "Переведено");
                    return;
                }
            } catch (fallbackErr) {
                console.error("Fallback error:", fallbackErr);
            }

            setStatus("error", "Ошибка перевода. Проверьте соединение.");
        }
    }

    function renderDictionary(dict) {
        if (!dict || !Array.isArray(dict) || dict.length === 0) {
            dictSection.style.display = "none";
            return;
        }

        dictSection.style.display = "block";
        dictContent.innerHTML = dict.map(group => {
            const posKey = (group[0] || "").toLowerCase();
            const posTitle = POS_TRANSLATIONS[posKey] || group[0];
            const entries = group[2] || [];

            return `
                <div class="tr-pos-group">
                    <div class="tr-pos-header">
                        <span class="tr-pos-badge">${posTitle}</span>
                    </div>
                    <div class="tr-pos-list">
                        ${entries.slice(0, 8).map(entry => {
                            const word = entry[0];
                            const reverseSynonyms = (entry[1] || []).slice(0, 4).join(", ");
                            return `
                                <div class="tr-dict-item" data-word="${word}" title="Нажмите, чтобы скопировать">
                                    <div class="tr-dict-word">${word}</div>
                                    ${reverseSynonyms ? `<div class="tr-dict-synonyms">${reverseSynonyms}</div>` : ''}
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            `;
        }).join("");

        // Clicking on a dictionary item copies word
        dictContent.querySelectorAll(".tr-dict-item").forEach(item => {
            item.addEventListener("click", () => {
                const word = item.dataset.word;
                if (word) {
                    copyToClipboard(word);
                    showToast(`Слово "${word}" скопировано`);
                }
            });
        });
    }

    function triggerTranslate(immediate = false) {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (immediate) {
            doTranslate();
        } else {
            debounceTimer = setTimeout(doTranslate, 350);
        }
    }

    // Input handlers
    sourceInput?.addEventListener("input", () => {
        const len = sourceInput.value.length;
        charCount.textContent = `${len} / 5000`;

        const hasText = len > 0;
        clearBtn.style.display = hasText ? "inline-flex" : "none";
        sourceTtsBtn.style.display = hasText ? "inline-flex" : "none";
        sourceCopyBtn.style.display = hasText ? "inline-flex" : "none";

        triggerTranslate(false);
    });

    clearBtn?.addEventListener("click", () => {
        sourceInput.value = "";
        charCount.textContent = "0 / 5000";
        clearBtn.style.display = "none";
        sourceTtsBtn.style.display = "none";
        sourceCopyBtn.style.display = "none";
        triggerTranslate(true);
    });

    sourceCopyBtn?.addEventListener("click", () => {
        if (sourceInput.value) {
            copyToClipboard(sourceInput.value);
        }
    });

    targetCopyBtn?.addEventListener("click", () => {
        if (currentTranslation) {
            copyToClipboard(currentTranslation);
        }
    });

    sourceTtsBtn?.addEventListener("click", () => {
        playTts(sourceInput.value, sourceLang, sourceTtsBtn);
    });

    targetTtsBtn?.addEventListener("click", () => {
        playTts(currentTranslation, targetLang, targetTtsBtn);
    });
}

// ==========================================
// 6. QR CODE STUDIO COMPONENT
// ==========================================

const QR_PRESET_SVGS = {
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="#ff0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    wifi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="#a771da" d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 4.5c2.97 0 5.68 1.13 7.76 2.98L12 19.34 4.24 11.48A11.37 11.37 0 0112 8.5zm0 4c1.66 0 3.19.64 4.36 1.7L12 18.57l-4.36-4.37c1.17-1.06 2.7-1.7 4.36-1.7z"/></svg>`,
    link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="#00c6ff" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
    discord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="#5865F2" d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`
};

function createPresetImage(svgString) {
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    return img;
}

const CACHED_PRESET_IMAGES = {
    youtube: createPresetImage(QR_PRESET_SVGS.youtube),
    github: createPresetImage(QR_PRESET_SVGS.github),
    wifi: createPresetImage(QR_PRESET_SVGS.wifi),
    link: createPresetImage(QR_PRESET_SVGS.link),
    discord: createPresetImage(QR_PRESET_SVGS.discord)
};

const QR_PRESET_PALETTE = [
    "#a771da", "#00c6ff", "#0072ff", "#10A37F", 
    "#F59E0B", "#EF4444", "#EC4899", "#ffffff", 
    "#888888", "#222222", "#0a0a0a", "#000000"
];

function initColorPickerPopover(container, initialHex, onChange) {
    if (!container) return { getValue: () => initialHex, setValue: () => {} };
    let currentHex = initialHex;

    function render() {
        container.innerHTML = `
            <div class="qr-color-popover-trigger">
                <button type="button" class="qr-color-swatch-box" aria-haspopup="dialog">
                    <span class="qr-color-swatch-preview" style="background-color: ${currentHex};"></span>
                    <span class="qr-color-swatch-hex">${currentHex.toUpperCase()}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#aaa">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </button>
                <div class="qr-color-popover-menu">
                    <div class="qr-color-presets-grid">
                        ${QR_PRESET_PALETTE.map(c => `
                            <button type="button" class="qr-color-preset-dot ${c.toLowerCase() === currentHex.toLowerCase() ? 'active' : ''}" style="background-color: ${c};" data-color="${c}" title="${c}"></button>
                        `).join('')}
                    </div>
                    <div class="qr-color-custom-input-row">
                        <label class="qr-native-color-btn" title="Выбрать оттенок в палитре">
                            <span>🎨</span>
                            <input type="color" class="qr-native-color-input" value="${currentHex}">
                        </label>
                        <input type="text" class="qr-input qr-color-hex-field" maxlength="7" value="${currentHex.toUpperCase()}" placeholder="#FFFFFF">
                    </div>
                </div>
            </div>
        `;

        const wrapper = container.querySelector(".qr-color-popover-trigger");
        const swatchBox = container.querySelector(".qr-color-swatch-box");
        const menu = container.querySelector(".qr-color-popover-menu");
        const presetDots = container.querySelectorAll(".qr-color-preset-dot");
        const nativeInput = container.querySelector(".qr-native-color-input");
        const hexField = container.querySelector(".qr-color-hex-field");

        function closeAllDropdowns() {
            document.querySelectorAll(".custom-dropdown.open").forEach(d => d.classList.remove("open"));
            document.querySelectorAll(".qr-color-popover-trigger.open").forEach(p => p.classList.remove("open"));
            document.querySelectorAll(".dropdown-active-box").forEach(b => b.classList.remove("dropdown-active-box"));
        }

        swatchBox?.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains("open");
            closeAllDropdowns();
            if (!isOpen) {
                wrapper.classList.add("open");
                container.closest(".qr-card-section, .fg-field-box")?.classList.add("dropdown-active-box");
                container.closest(".qr-field-group")?.classList.add("dropdown-active-box");
                container.closest(".qr-field-row")?.classList.add("dropdown-active-box");
            }
        });

        menu?.addEventListener("click", (e) => e.stopPropagation());

        presetDots.forEach(dot => {
            dot.addEventListener("click", (e) => {
                e.stopPropagation();
                currentHex = dot.dataset.color;
                closeAllDropdowns();
                render();
                if (onChange) onChange(currentHex);
            });
        });

        nativeInput?.addEventListener("input", (e) => {
            currentHex = e.target.value;
            if (hexField) hexField.value = currentHex.toUpperCase();
            const preview = container.querySelector(".qr-color-swatch-preview");
            if (preview) preview.style.backgroundColor = currentHex;
            const hexText = container.querySelector(".qr-color-swatch-hex");
            if (hexText) hexText.textContent = currentHex.toUpperCase();
            if (onChange) onChange(currentHex);
        });

        hexField?.addEventListener("input", (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith("#")) val = "#" + val;
            if (/^#[0-9a-f]{6}$/i.test(val)) {
                currentHex = val;
                if (nativeInput) nativeInput.value = currentHex;
                const preview = container.querySelector(".qr-color-swatch-preview");
                if (preview) preview.style.backgroundColor = currentHex;
                const hexText = container.querySelector(".qr-color-swatch-hex");
                if (hexText) hexText.textContent = currentHex.toUpperCase();
                if (onChange) onChange(currentHex);
            }
        });

        const handleOutsideClick = (e) => {
            if (!container.contains(e.target)) {
                if (wrapper && wrapper.classList.contains("open")) {
                    closeAllDropdowns();
                }
            }
        };
        window.addEventListener("click", handleOutsideClick);
    }

    render();

    return {
        getValue: () => currentHex,
        setValue: (val) => {
            currentHex = val;
            render();
            if (onChange) onChange(val);
        }
    };
}

function getQrStudioHtml() {
    return `
        <div class="qr-studio-container">
            <!-- Left Config Column -->
            <div class="qr-config-panel">
                <!-- Type Tabs (Without Telegram) -->
                <div class="qr-type-tabs">
                    <button type="button" class="qr-type-btn active" data-type="url">🔗 Ссылка</button>
                    <button type="button" class="qr-type-btn" data-type="text">📝 Текст</button>
                    <button type="button" class="qr-type-btn" data-type="wifi">📶 Wi-Fi</button>
                    <button type="button" class="qr-type-btn" data-type="vcard">👤 Контакт</button>
                    <button type="button" class="qr-type-btn" data-type="email">📧 Email</button>
                </div>

                <!-- Dynamic Data Inputs -->
                <div class="qr-card-section" id="qrDataSection">
                    <!-- URL (default) -->
                    <div class="qr-field-group qr-type-fields" id="qrFields-url">
                        <label class="qr-label">Ссылка на сайт или страницу:</label>
                        <input type="text" class="qr-input" id="qrInputUrl" placeholder="https://example.com" value="https://shamper.ru">
                    </div>

                    <!-- Plain Text -->
                    <div class="qr-field-group qr-type-fields" id="qrFields-text" style="display:none;">
                        <label class="qr-label">Произвольный текст:</label>
                        <textarea class="qr-textarea" id="qrInputText" placeholder="Введите любой текст или заметку..."></textarea>
                    </div>

                    <!-- Wi-Fi -->
                    <div class="qr-type-fields" id="qrFields-wifi" style="display:none;">
                        <div class="qr-field-group">
                            <label class="qr-label">Название сети (SSID):</label>
                            <input type="text" class="qr-input" id="qrWifiSsid" placeholder="MyHome_WiFi">
                        </div>
                        <div class="qr-field-group" id="qrWifiPassBox">
                            <label class="qr-label">Пароль сети:</label>
                            <input type="text" class="qr-input" id="qrWifiPass" placeholder="Пароль от Wi-Fi">
                        </div>
                        <div class="qr-field-row" style="align-items:center;">
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Тип шифрования:</label>
                                <div id="qrWifiEncDropdown"></div>
                            </div>
                            <label class="qr-checkbox-label" style="margin-top:20px;">
                                <input type="checkbox" id="qrWifiHidden"> Скрытая сеть
                            </label>
                        </div>
                    </div>

                    <!-- vCard Contact -->
                    <div class="qr-type-fields" id="qrFields-vcard" style="display:none;">
                        <div class="qr-field-row">
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Имя:</label>
                                <input type="text" class="qr-input" id="qrVcardFirst" placeholder="Иван">
                            </div>
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Фамилия:</label>
                                <input type="text" class="qr-input" id="qrVcardLast" placeholder="Иванов">
                            </div>
                        </div>
                        <div class="qr-field-row">
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Телефон:</label>
                                <input type="text" class="qr-input" id="qrVcardPhone" placeholder="+7 999 123-45-67">
                            </div>
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Email:</label>
                                <input type="text" class="qr-input" id="qrVcardEmail" placeholder="user@domain.com">
                            </div>
                        </div>
                        <div class="qr-field-row">
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Организация / Роль:</label>
                                <input type="text" class="qr-input" id="qrVcardOrg" placeholder="Developer / Company">
                            </div>
                            <div class="qr-field-group" style="flex:1;">
                                <label class="qr-label">Веб-сайт:</label>
                                <input type="text" class="qr-input" id="qrVcardUrl" placeholder="https://domain.com">
                            </div>
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="qr-type-fields" id="qrFields-email" style="display:none;">
                        <div class="qr-field-group">
                            <label class="qr-label">Email получателя:</label>
                            <input type="text" class="qr-input" id="qrEmailTo" placeholder="example@mail.com">
                        </div>
                        <div class="qr-field-group">
                            <label class="qr-label">Тема письма:</label>
                            <input type="text" class="qr-input" id="qrEmailSubject" placeholder="Вопрос по сотрудничеству">
                        </div>
                        <div class="qr-field-group">
                            <label class="qr-label">Текст сообщения:</label>
                            <textarea class="qr-textarea" id="qrEmailBody" placeholder="Здравствуйте, пишу вам по поводу..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Customization Sections -->
                
                <!-- 1. Цвета с кастомным поповером -->
                <div class="qr-card-section">
                    <div class="qr-section-header">
                        <span class="qr-section-title">🎨 Цветовая схема</span>
                    </div>
                    <div class="qr-field-row">
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Тип заливки:</label>
                            <div id="qrColorModeDropdown"></div>
                        </div>
                        <div class="qr-field-group" style="flex:1;" id="qrGradAngleBox">
                            <label class="qr-label">Угол градиента:</label>
                            <div id="qrGradAngleDropdown"></div>
                        </div>
                    </div>

                    <div class="qr-field-row" style="margin-top:6px;">
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Цвет 1 (Точки):</label>
                            <div id="qrFgColor1Container"></div>
                        </div>
                        <div class="qr-field-group" style="flex:1;" id="qrFgColor2Box">
                            <label class="qr-label">Цвет 2 (Точки):</label>
                            <div id="qrFgColor2Container"></div>
                        </div>
                    </div>

                    <div class="qr-field-row" style="margin-top:6px; align-items:center;">
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Цвет фона:</label>
                            <div id="qrBgColorContainer"></div>
                        </div>
                        <div class="qr-field-group" style="flex:1; justify-content:flex-end; margin-top:20px;">
                            <label class="qr-checkbox-label">
                                <input type="checkbox" id="qrTransparentBg"> Прозрачный фон
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 2. Форма и геометрия с кастомными менюшками -->
                <div class="qr-card-section">
                    <div class="qr-section-header">
                        <span class="qr-section-title">💠 Форма и стиль модулей</span>
                    </div>
                    <div class="qr-field-row">
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Форма точек:</label>
                            <div id="qrDotShapeDropdown"></div>
                        </div>
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Угловые рамки (Corners):</label>
                            <div id="qrCornerShapeDropdown"></div>
                        </div>
                    </div>
                </div>

                <!-- 3. Логотип в центре -->
                <div class="qr-card-section">
                    <div class="qr-section-header">
                        <span class="qr-section-title">🖼️ Логотип по центру</span>
                    </div>
                    <div class="qr-preset-logos-row">
                        <button type="button" class="qr-preset-logo-btn active" data-preset="none" title="Без логотипа">Нет</button>
                        <button type="button" class="qr-preset-logo-btn" data-preset="youtube" title="YouTube">
                            ${QR_PRESET_SVGS.youtube}
                        </button>
                        <button type="button" class="qr-preset-logo-btn" data-preset="github" title="GitHub">
                            ${QR_PRESET_SVGS.github}
                        </button>
                        <button type="button" class="qr-preset-logo-btn" data-preset="wifi" title="Wi-Fi">
                            ${QR_PRESET_SVGS.wifi}
                        </button>
                        <button type="button" class="qr-preset-logo-btn" data-preset="link" title="Ссылка">
                            ${QR_PRESET_SVGS.link}
                        </button>
                        <button type="button" class="qr-preset-logo-btn" data-preset="discord" title="Discord">
                            ${QR_PRESET_SVGS.discord}
                        </button>
                    </div>

                    <div class="qr-custom-upload-row">
                        <label class="qr-upload-btn" for="qrLogoFileInput">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                            </svg>
                            Загрузить свой файл (PNG, SVG, JPG)
                        </label>
                        <input type="file" id="qrLogoFileInput" accept="image/*" style="display:none;">
                        <button type="button" class="qr-remove-logo-btn" id="qrRemoveLogoBtn" style="display:none;" title="Удалить логотип">✕</button>
                    </div>
                </div>

                <!-- 4. Коррекция ошибок -->
                <div class="qr-card-section">
                    <div class="qr-field-row" style="align-items:center;">
                        <div class="qr-field-group" style="flex:1;">
                            <label class="qr-label">Уровень коррекции ошибок (Error Correction):</label>
                            <div id="qrEcLevelDropdown"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Preview & Export Column -->
            <div class="qr-preview-panel">
                <div class="qr-canvas-card">
                    <div class="qr-canvas-box" id="qrCanvasBox">
                        <canvas id="qrCanvas" width="300" height="300"></canvas>
                    </div>
                </div>

                <!-- Resolution & Export Controls -->
                <div class="qr-export-card">
                    <div class="qr-field-group" style="margin-bottom:12px;">
                        <label class="qr-label">Разрешение при скачивании:</label>
                        <div class="qr-res-selector">
                            <button type="button" class="qr-res-btn" data-res="512">512 px</button>
                            <button type="button" class="qr-res-btn active" data-res="1024">1024 px</button>
                            <button type="button" class="qr-res-btn" data-res="2048">2048 px</button>
                        </div>
                    </div>

                    <div class="qr-export-btns">
                        <button type="button" class="qr-export-btn qr-btn-primary" id="qrDownloadPngBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            Скачать PNG
                        </button>
                        <button type="button" class="qr-export-btn qr-btn-secondary" id="qrDownloadSvgBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            Скачать SVG
                        </button>
                        <button type="button" class="qr-export-btn qr-btn-secondary" id="qrCopyBtn" title="Копировать картинку в буфер">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            Копировать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initQrStudio() {
    let currentType = "url";
    let exportResolution = 1024;
    let customLogoImg = null;
    let activePresetLogo = "none";

    let colorMode = "gradient";
    let gradAngle = "135";
    let fgColor1 = "#a771da";
    let fgColor2 = "#00c6ff";
    let bgColor = "#0a0a0a";
    let dotShape = "rounded";
    let cornerShape = "rounded";
    let ecLevel = "H";
    let wifiEnc = "WPA";

    const canvas = document.getElementById("qrCanvas");
    if (!canvas) return;

    // Elements
    const typeButtons = document.querySelectorAll(".qr-type-btn");
    const typeFields = document.querySelectorAll(".qr-type-fields");

    const gradAngleBox = document.getElementById("qrGradAngleBox");
    const fgColor2Box = document.getElementById("qrFgColor2Box");
    const wifiPassBox = document.getElementById("qrWifiPassBox");
    const transparentBgCheckbox = document.getElementById("qrTransparentBg");

    const presetLogoButtons = document.querySelectorAll(".qr-preset-logo-btn");
    const logoFileInput = document.getElementById("qrLogoFileInput");
    const removeLogoBtn = document.getElementById("qrRemoveLogoBtn");

    const resButtons = document.querySelectorAll(".qr-res-btn");
    const downloadPngBtn = document.getElementById("qrDownloadPngBtn");
    const downloadSvgBtn = document.getElementById("qrDownloadSvgBtn");
    const copyBtn = document.getElementById("qrCopyBtn");

    // Initialize custom dropdowns
    initCustomDropdown(document.getElementById("qrWifiEncDropdown"), [
        { value: "WPA", label: "WPA / WPA2 / WPA3 (Обычный)" },
        { value: "WEP", label: "WEP" },
        { value: "nopass", label: "Без пароля (Открытая)" }
    ], "WPA", (val) => {
        wifiEnc = val;
        if (wifiPassBox) wifiPassBox.style.display = (val === "nopass") ? "none" : "block";
        renderQr();
    });

    initCustomDropdown(document.getElementById("qrColorModeDropdown"), [
        { value: "gradient", label: "Линейный градиент" },
        { value: "single", label: "Сплошной цвет" }
    ], "gradient", (val) => {
        colorMode = val;
        const isGrad = val === "gradient";
        if (gradAngleBox) gradAngleBox.style.display = isGrad ? "block" : "none";
        if (fgColor2Box) fgColor2Box.style.display = isGrad ? "block" : "none";
        renderQr();
    });

    initCustomDropdown(document.getElementById("qrGradAngleDropdown"), [
        { value: "135", label: "135° (По диагонали)" },
        { value: "90", label: "90° (Сверху вниз)" },
        { value: "0", label: "0° (Слева направо)" },
        { value: "45", label: "45° (Снизу вверх)" }
    ], "135", (val) => {
        gradAngle = val;
        renderQr();
    });

    initCustomDropdown(document.getElementById("qrDotShapeDropdown"), [
        { value: "rounded", label: "Скругленные (Rounded)" },
        { value: "dots", label: "Кружочки (Dots)" },
        { value: "square", label: "Квадратные (Classic)" },
        { value: "diamond", label: "Сглаженные ромбы" }
    ], "rounded", (val) => {
        dotShape = val;
        renderQr();
    });

    initCustomDropdown(document.getElementById("qrCornerShapeDropdown"), [
        { value: "rounded", label: "Скругленные" },
        { value: "circle", label: "Круглые" },
        { value: "square", label: "Квадратные" }
    ], "rounded", (val) => {
        cornerShape = val;
        renderQr();
    });

    const ecDropdownCtrl = initCustomDropdown(document.getElementById("qrEcLevelDropdown"), [
        { value: "H", label: "H (30% — ультра-надежная / с логотипами)" },
        { value: "Q", label: "Q (25% — повышенная)" },
        { value: "M", label: "M (15% — стандартная)" },
        { value: "L", label: "L (7% — наименьшая плотность)" }
    ], "H", (val) => {
        ecLevel = val;
        renderQr();
    });

    // Initialize custom color popovers
    initColorPickerPopover(document.getElementById("qrFgColor1Container"), "#a771da", (val) => {
        fgColor1 = val;
        renderQr();
    });

    initColorPickerPopover(document.getElementById("qrFgColor2Container"), "#00c6ff", (val) => {
        fgColor2 = val;
        renderQr();
    });

    initColorPickerPopover(document.getElementById("qrBgColorContainer"), "#0a0a0a", (val) => {
        bgColor = val;
        renderQr();
    });

    transparentBgCheckbox?.addEventListener("change", renderQr);

    // Type tab switching
    typeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            typeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentType = btn.dataset.type;

            typeFields.forEach(f => f.style.display = "none");
            const targetField = document.getElementById(`qrFields-${currentType}`);
            if (targetField) targetField.style.display = "block";

            renderQr();
        });
    });

    // Inputs change handlers
    document.querySelectorAll(".qr-type-fields input, .qr-type-fields textarea").forEach(inp => {
        inp.addEventListener("input", renderQr);
        inp.addEventListener("change", renderQr);
    });

    // Preset Logo Handlers
    function setPresetLogo(preset) {
        activePresetLogo = preset;
        presetLogoButtons.forEach(b => b.classList.toggle("active", b.dataset.preset === preset));
        if (removeLogoBtn) removeLogoBtn.style.display = (preset !== "none") ? "inline-flex" : "none";

        if (preset !== "none" && CACHED_PRESET_IMAGES[preset]) {
            customLogoImg = CACHED_PRESET_IMAGES[preset];
        } else {
            customLogoImg = null;
        }
        renderQr();
    }

    presetLogoButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            setPresetLogo(btn.dataset.preset);
        });
    });

    logoFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                customLogoImg = img;
                activePresetLogo = "custom";
                presetLogoButtons.forEach(b => b.classList.remove("active"));
                if (removeLogoBtn) removeLogoBtn.style.display = "inline-flex";
                ecDropdownCtrl?.setValue("H");
                ecLevel = "H";
                renderQr();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    removeLogoBtn?.addEventListener("click", () => {
        setPresetLogo("none");
        if (logoFileInput) logoFileInput.value = "";
    });

    // Resolution selection
    resButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            resButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            exportResolution = parseInt(btn.dataset.res, 10) || 1024;
        });
    });

    // Compute payload string based on active type
    function getQrDataString() {
        switch (currentType) {
            case "url": {
                let url = (document.getElementById("qrInputUrl")?.value || "").trim();
                if (!url) return "https://shamper.ru";
                if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
                    url = "https://" + url;
                }
                return url;
            }
            case "text":
                return (document.getElementById("qrInputText")?.value || "").trim() || "QR Code Studio";
            case "wifi": {
                const ssid = (document.getElementById("qrWifiSsid")?.value || "").trim() || "WiFi_Network";
                const pass = (document.getElementById("qrWifiPass")?.value || "").trim();
                const enc = wifiEnc || "WPA";
                const hidden = document.getElementById("qrWifiHidden")?.checked ? "true" : "false";
                if (enc === "nopass") {
                    return `WIFI:S:${ssid};T:nopass;H:${hidden};;`;
                }
                return `WIFI:S:${ssid};T:${enc};P:${pass};H:${hidden};;`;
            }
            case "vcard": {
                const fn = (document.getElementById("qrVcardFirst")?.value || "").trim();
                const ln = (document.getElementById("qrVcardLast")?.value || "").trim();
                const phone = (document.getElementById("qrVcardPhone")?.value || "").trim();
                const email = (document.getElementById("qrVcardEmail")?.value || "").trim();
                const org = (document.getElementById("qrVcardOrg")?.value || "").trim();
                const web = (document.getElementById("qrVcardUrl")?.value || "").trim();
                return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nURL:${web}\nEND:VCARD`;
            }
            case "email": {
                const to = (document.getElementById("qrEmailTo")?.value || "").trim();
                const subj = (document.getElementById("qrEmailSubject")?.value || "").trim();
                const body = (document.getElementById("qrEmailBody")?.value || "").trim();
                return `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
            }
            default:
                return "https://shamper.ru";
        }
    }

    // Is coordinate inside one of the 3 corner finder patterns (7x7)
    function isCorner(row, col, count) {
        return (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7);
    }

    // Core Drawing Function onto any given canvas
    function drawQrToCanvas(targetCanvas, renderSize) {
        const text = getQrDataString();
        let activeEc = ecLevel || "H";

        let qr;
        try {
            qr = window.qrcode(0, activeEc);
            qr.addData(text);
            qr.make();
        } catch (e) {
            // If data is very large, try falling back to M or L
            try {
                qr = window.qrcode(0, "M");
                qr.addData(text);
                qr.make();
            } catch (e2) {
                console.error("QR Generation failed:", e2);
                return;
            }
        }

        const count = qr.getModuleCount();
        const ctx = targetCanvas.getContext("2d");
        targetCanvas.width = renderSize;
        targetCanvas.height = renderSize;

        // Clear canvas
        ctx.clearRect(0, 0, renderSize, renderSize);

        const isTransparent = transparentBgCheckbox ? transparentBgCheckbox.checked : false;

        if (!isTransparent) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, renderSize, renderSize);
        }

        const padding = Math.floor(renderSize * 0.08);
        const innerSize = renderSize - padding * 2;
        const cellSize = innerSize / count;

        // Create Foreground Gradient or Color
        const angleDeg = parseInt(gradAngle, 10) || 135;

        let fgStyle = fgColor1;
        if (colorMode === "gradient") {
            const angleRad = (angleDeg * Math.PI) / 180;
            const x0 = renderSize / 2 - Math.cos(angleRad) * (renderSize / 2);
            const y0 = renderSize / 2 - Math.sin(angleRad) * (renderSize / 2);
            const x1 = renderSize / 2 + Math.cos(angleRad) * (renderSize / 2);
            const y1 = renderSize / 2 + Math.sin(angleRad) * (renderSize / 2);
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0, fgColor1);
            grad.addColorStop(1, fgColor2);
            fgStyle = grad;
        }

        ctx.fillStyle = fgStyle;

        // 1. Draw Data Modules (excluding 7x7 corner eye areas)
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isCorner(r, c, count)) continue;
                if (qr.isDark(r, c)) {
                    const x = padding + c * cellSize;
                    const y = padding + r * cellSize;
                    const s = cellSize;

                    ctx.beginPath();
                    if (dotShape === "dots") {
                        ctx.arc(x + s / 2, y + s / 2, s * 0.44, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (dotShape === "rounded") {
                        if (ctx.roundRect) {
                            ctx.roundRect(x + s * 0.06, y + s * 0.06, s * 0.88, s * 0.88, s * 0.35);
                        } else {
                            ctx.rect(x, y, s, s);
                        }
                        ctx.fill();
                    } else if (dotShape === "diamond") {
                        ctx.moveTo(x + s / 2, y + s * 0.05);
                        ctx.lineTo(x + s * 0.95, y + s / 2);
                        ctx.lineTo(x + s / 2, y + s * 0.95);
                        ctx.lineTo(x + s * 0.05, y + s / 2);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.fillRect(x, y, s, s);
                    }
                }
            }
        }

        // 2. Draw 3 Corner Eyes (Top-Left, Top-Right, Bottom-Left)
        function drawCornerEye(originR, originC) {
            const ox = padding + originC * cellSize;
            const oy = padding + originR * cellSize;
            const outerSize = 7 * cellSize;
            const innerSize = 3 * cellSize;
            const innerOffset = 2 * cellSize;

            ctx.fillStyle = fgStyle;

            // Outer Frame
            ctx.beginPath();
            if (cornerShape === "circle") {
                ctx.arc(ox + outerSize / 2, oy + outerSize / 2, outerSize / 2, 0, Math.PI * 2);
            } else if (cornerShape === "rounded") {
                if (ctx.roundRect) {
                    ctx.roundRect(ox, oy, outerSize, outerSize, cellSize * 2);
                } else {
                    ctx.rect(ox, oy, outerSize, outerSize);
                }
            } else {
                ctx.rect(ox, oy, outerSize, outerSize);
            }
            ctx.fill();

            // Clear middle hole
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            const holeSize = 5 * cellSize;
            const holeOffset = cellSize;
            if (cornerShape === "circle") {
                ctx.arc(ox + holeOffset + holeSize / 2, oy + holeOffset + holeSize / 2, holeSize / 2, 0, Math.PI * 2);
            } else if (cornerShape === "rounded") {
                if (ctx.roundRect) {
                    ctx.roundRect(ox + holeOffset, oy + holeOffset, holeSize, holeSize, cellSize * 1.2);
                } else {
                    ctx.rect(ox + holeOffset, oy + holeOffset, holeSize, holeSize);
                }
            } else {
                ctx.rect(ox + holeOffset, oy + holeOffset, holeSize, holeSize);
            }
            ctx.fill();
            ctx.restore();

            // Re-fill background under hole if not transparent
            if (!isTransparent) {
                ctx.fillStyle = bgColor;
                ctx.beginPath();
                const holeSize = 5 * cellSize;
                const holeOffset = cellSize;
                if (cornerShape === "circle") {
                    ctx.arc(ox + holeOffset + holeSize / 2, oy + holeOffset + holeSize / 2, holeSize / 2, 0, Math.PI * 2);
                } else if (cornerShape === "rounded") {
                    if (ctx.roundRect) {
                        ctx.roundRect(ox + holeOffset, oy + holeOffset, holeSize, holeSize, cellSize * 1.2);
                    } else {
                        ctx.rect(ox + holeOffset, oy + holeOffset, holeSize, holeSize);
                    }
                } else {
                    ctx.rect(ox + holeOffset, oy + holeOffset, holeSize, holeSize);
                }
                ctx.fill();
            }

            // Inner Central Dot
            ctx.fillStyle = fgStyle;
            ctx.beginPath();
            if (cornerShape === "circle") {
                ctx.arc(ox + innerOffset + innerSize / 2, oy + innerOffset + innerSize / 2, innerSize / 2, 0, Math.PI * 2);
            } else if (cornerShape === "rounded") {
                if (ctx.roundRect) {
                    ctx.roundRect(ox + innerOffset, oy + innerOffset, innerSize, innerSize, cellSize * 0.8);
                } else {
                    ctx.rect(ox + innerOffset, oy + innerOffset, innerSize, innerSize);
                }
            } else {
                ctx.rect(ox + innerOffset, oy + innerOffset, innerSize, innerSize);
            }
            ctx.fill();
        }

        drawCornerEye(0, 0);
        drawCornerEye(0, count - 7);
        drawCornerEye(count - 7, 0);

        // 3. Draw Center Logo Badge if present
        if (customLogoImg) {
            const logoSize = Math.floor(renderSize * 0.22);
            const logoX = (renderSize - logoSize) / 2;
            const logoY = (renderSize - logoSize) / 2;
            const badgeRadius = Math.floor(logoSize * 0.25);

            // Background badge for logo
            ctx.fillStyle = isTransparent ? "#0a0a0a" : bgColor;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12, badgeRadius + 4);
            } else {
                ctx.rect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12);
            }
            ctx.fill();

            // Border badge
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = Math.max(1, Math.floor(renderSize / 400));
            ctx.stroke();

            // Draw image inside clip
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(logoX, logoY, logoSize, logoSize, badgeRadius);
            } else {
                ctx.rect(logoX, logoY, logoSize, logoSize);
            }
            ctx.clip();
            try {
                ctx.drawImage(customLogoImg, logoX, logoY, logoSize, logoSize);
            } catch (err) {
                console.warn("Logo draw error:", err);
            }
            ctx.restore();
        }
    }

    function renderQr() {
        drawQrToCanvas(canvas, 300);
    }

    // Export Handlers
    downloadPngBtn?.addEventListener("click", () => {
        const offCanvas = document.createElement("canvas");
        drawQrToCanvas(offCanvas, exportResolution);

        offCanvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode_${exportResolution}px.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("QR-код успешно скачан!");
        }, "image/png");
    });

    downloadSvgBtn?.addEventListener("click", () => {
        const text = getQrDataString();
        let activeEc = ecLevel || "H";
        let qr;
        try {
            qr = window.qrcode(0, activeEc);
            qr.addData(text);
            qr.make();
        } catch (e) {
            try {
                qr = window.qrcode(0, "M");
                qr.addData(text);
                qr.make();
            } catch (e2) {
                console.error(e2);
                return;
            }
        }

        const count = qr.getModuleCount();
        const size = 1000;
        const padding = 80;
        const inner = size - padding * 2;
        const cell = inner / count;

        const isTransparent = transparentBgCheckbox ? transparentBgCheckbox.checked : false;
        const isGrad = colorMode === "gradient";

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">\n`;
        if (isGrad) {
            svg += `  <defs>\n    <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="${fgColor1}"/>\n      <stop offset="100%" stop-color="${fgColor2}"/>\n    </linearGradient>\n  </defs>\n`;
        }
        if (!isTransparent) {
            svg += `  <rect width="${size}" height="${size}" fill="${bgColor}"/>\n`;
        }

        const fillAttr = isGrad ? 'url(#qrGrad)' : fgColor1;

        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (qr.isDark(r, c)) {
                    const x = padding + c * cell;
                    const y = padding + r * cell;
                    svg += `  <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${(cell * 0.35).toFixed(2)}" fill="${fillAttr}"/>\n`;
                }
            }
        }
        svg += `</svg>`;

        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode_vector.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Векторный SVG скачан!");
    });

    copyBtn?.addEventListener("click", async () => {
        const offCanvas = document.createElement("canvas");
        drawQrToCanvas(offCanvas, 1024);

        offCanvas.toBlob(async (blob) => {
            if (!blob) return;
            try {
                if (navigator.clipboard && navigator.clipboard.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);
                    showToast("QR-код скопирован в буфер!");
                } else {
                    showToast("Копирование картинок не поддерживается");
                }
            } catch (err) {
                console.error(err);
                showToast("Не удалось скопировать");
            }
        }, "image/png");
    });

    // Initial render
    renderQr();
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

