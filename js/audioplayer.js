const tracks = [
  {
    file: "track1.flac",
    title: "the kill 2",
    author: "Lex Amarni, 2muchmotion",
    cover: "track1.jpg"
  },
  {
    file: "track2.flac",
    title: "To Whom It May Concern",
    author: "Ghostemane, Parv0",
    cover: "track2.jpg"
  },
  {
    file: "track3.flac",
    title: "Win Forever (speed up)",
    author: "Artificial Intelligence Memory Disc",
    cover: "track3.jpg"
  },
  // { 
  //   file: "track4.flac",
  //   title: "Tartan",
  //   author: "EsDeeKid, Fimiguerrero",
  //   cover: "track4.jpg"
  // },
  // { 
  //   file: "track5.flac",
  //   title: "1-800",
  //   author: "bbno$, ironmouse",
  //   cover: "track5.jpg"
  // },
  // { 
  //   file: "track6.flac",
  //   title: "jessie",
  //   author: "Riserayss, LONOWN",
  //   cover: "track6.jpg"
  // },
  {
    file: "track7.flac",
    title: "Thelema (Slowed)",
    author: "Øfdream",
    cover: "track7.jpg"
  },
  {
    file: "track8.flac",
    title: "Code Red",
    author: "Darci",
    cover: "track8.jpg"
  },
  {
    file: "track9.flac",
    title: "Sum Of All Fears",
    author: "Matt Darey, Tiff Lacey",
    cover: "track9.jpg"
  },
  {
    file: "track10.mp3",
    title: "Hold Me Down",
    author: "Mr.Kitty",
    cover: "track10.jpg"
  },
  {
    file: "track11.mp3",
    title: "Box Wine",
    author: "Carter Tomorrow",
    cover: "track11.jpg"
  },
  {
    file: "track12.mp3",
    title: "Water World",
    author: "Derek Pope",
    cover: "track12.jpg"
  }
]

// ===== CONFIG =====
const audioFolder = './assets/player/audio/';
let currentTrackIndex = 0;
let currentPlaylist = "radio";

// ===== DOM =====
let styleElements = [];
const originalStyles = new Map();

const seekSlider = document.getElementById('seekSlider');
const audioElement = document.getElementById('audio');
const prevTrackButton = document.getElementById('prevTrack');
const playPauseBtn = document.getElementById('playPause');
const nextTrackButton = document.getElementById('nextTrack');
const volumeInput = document.getElementById('volume');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const trackTitleSpan = document.getElementById('trackTitle');
const trackAuthorSpan = document.getElementById('trackAuthor');
const playPauseIcon = document.getElementById('playPauseIcon');
const trackIDSpan = document.getElementById('trackID');
const trackCover = document.getElementById('trackCover');
const likeButton = document.getElementById('likeButton');

// Mini capsule elements
const audioPlayer = document.getElementById('audioPlayer');
const playerMini = document.getElementById('playerMini');
const playerMiniInfo = document.getElementById('playerMiniInfo');
const playerMiniCoverWrap = document.getElementById('playerMiniCoverWrap');
const miniCover = document.getElementById('miniCover');
const miniAuthor = document.getElementById('miniAuthor');
const miniTitle = document.getElementById('miniTitle');
const miniPrevTrack = document.getElementById('miniPrevTrack');
const miniPlayPause = document.getElementById('miniPlayPause');
const miniPlayPauseIcon = document.getElementById('miniPlayPauseIcon');
const miniNextTrack = document.getElementById('miniNextTrack');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const playerBackdrop = document.getElementById('playerBackdrop');


audioElement.volume = 0.25;
volumeInput.value = 0.25;
repeatTrack = false;
// ===== UTILS =====

function getCurrentTrack() {
  return tracks[currentTrackIndex];
}

let playbackStarted = false;

function startPlayback(e) {
  if (playbackStarted) return;
  const settings = window.getSiteSettings ? window.getSiteSettings() : { autoplay: true, player: true };
  if (!settings.autoplay || !settings.player) return;

  // If page was opened directly with a utility and modal is open, delay playback until modal closes
  if (window.openedViaDirectUtil) {
    return;
  }
  playbackStarted = true;
  loadTrack(true);
  audioElement.play().catch(console.error);
}

window.startDelayedPlayback = function () {
  const settings = window.getSiteSettings ? window.getSiteSettings() : { autoplay: true, player: true };
  if (!settings.autoplay || !settings.player) return;

  if (!playbackStarted) {
    playbackStarted = true;
    loadTrack(true);
    audioElement.play().catch(console.error);
  }
};

document.addEventListener('click', startPlayback);

function updateTrackInfo() {
  const track = getCurrentTrack();
  trackTitleSpan.textContent = track.title;
  trackAuthorSpan.textContent = track.author || '';
  const coverSrc = track.cover ? `assets/player/covers/${track.cover}` : 'assets/player/covers/unknown-track.png';
  trackCover.src = coverSrc;

  // Sync with mini capsule player
  if (miniTitle) miniTitle.textContent = track.title;
  if (miniAuthor) miniAuthor.textContent = track.author || '';
  if (miniCover) miniCover.src = coverSrc;
}

// ===== DYNAMIC AUDIO-REACTIVE COVER THEME =====
const DEFAULT_COVER_PALETTE = {
  first_color: "#a771da",
  second_color: "#ffa8c2",
  first_color_rgb: "167, 113, 218",
  gradient: "linear-gradient(135deg, #a771da, #ffa8c2)",
  track_color: "#ff00fb"
};

const TRACK_FALLBACK_COLORS = {
  "track1.jpg": { primary: "rgb(235, 145, 45)", primaryRgb: "235, 145, 45", secondary: "rgb(255, 185, 80)", isMonochrome: false }, // Warm amber gold
  "track2.jpg": { primary: "rgb(220, 220, 230)", primaryRgb: "220, 220, 230", secondary: "rgb(150, 150, 165)", isMonochrome: true }, // B&W gothic platinum silver
  "track3.jpg": { primary: "rgb(30, 200, 255)", primaryRgb: "30, 200, 255", secondary: "rgb(95, 225, 255)", isMonochrome: false }, // Electric neon cyan CRT
  "track4.jpg": { primary: "rgb(230, 230, 240)", primaryRgb: "230, 230, 240", secondary: "rgb(160, 160, 175)", isMonochrome: true }, // Clean monochrome silver/white
  "track5.jpg": { primary: "rgb(255, 60, 150)", primaryRgb: "255, 60, 150", secondary: "rgb(255, 160, 215)", isMonochrome: false }, // Hot magenta/pink
  "track6.jpg": { primary: "rgb(205, 170, 120)", primaryRgb: "205, 170, 120", secondary: "rgb(240, 215, 175)", isMonochrome: false }, // Vintage sepia gold
  "track7.jpg": { primary: "rgb(225, 225, 235)", primaryRgb: "225, 225, 235", secondary: "rgb(150, 150, 170)", isMonochrome: true }, // Black & white wrap (clean silver monochrome)
  "track8.jpg": { primary: "rgb(245, 30, 45)", primaryRgb: "245, 30, 45", secondary: "rgb(255, 100, 110)", isMonochrome: false }, // Code Red crimson
  "track9.jpg": { primary: "rgb(175, 35, 50)", primaryRgb: "175, 35, 50", secondary: "rgb(230, 85, 100)", isMonochrome: false }, // Velvet wine red
  "track10.jpg": { primary: "rgb(240, 25, 35)", primaryRgb: "240, 25, 35", secondary: "rgb(255, 80, 90)", isMonochrome: false }, // Blood red occult circle
  "track11.jpg": { primary: "rgb(220, 220, 235)", primaryRgb: "220, 220, 235", secondary: "rgb(150, 150, 170)", isMonochrome: true }, // B&W wine glass
  "track12.jpg": { primary: "rgb(30, 215, 230)", primaryRgb: "30, 215, 230", secondary: "rgb(230, 115, 215)", isMonochrome: false } // Neon cyan/turquoise Miracle Mile
};

const coverColorCache = new Map();

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function sampleImageElement(imgEl, coverFileName) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const size = 40;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(imgEl, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    // 12 hue buckets (30 deg each)
    const numBuckets = 12;
    const buckets = Array.from({ length: numBuckets }, () => ({
      count: 0,
      totalScore: 0,
      sumR: 0,
      sumG: 0,
      sumB: 0
    }));

    let colorfulPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue;

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const delta = max - min;
      const brightness = (max + min) / 2;

      // Filter out deep shadows/blacks (< 42), blown highlights (> 230), and near-greys (delta < 26)
      // This prevents JPEG compression noise in black/dark areas from being counted as colors
      if (brightness < 42 || brightness > 230 || delta < 26) continue;

      const sat = delta / max;
      if (sat < 0.22) continue;

      const { h } = rgbToHsl(r, g, b);
      const bucketIdx = Math.min(numBuckets - 1, Math.floor(h * numBuckets));
      const score = sat * (1 - Math.abs(brightness - 130) / 130);

      buckets[bucketIdx].count++;
      buckets[bucketIdx].totalScore += score;
      buckets[bucketIdx].sumR += r;
      buckets[bucketIdx].sumG += g;
      buckets[bucketIdx].sumB += b;
      colorfulPixelCount++;
    }

    // If image is essentially black & white / monochrome (under 20 colored pixels out of 1600)
    if (colorfulPixelCount < 20) {
      if (coverFileName && TRACK_FALLBACK_COLORS[coverFileName]) {
        return TRACK_FALLBACK_COLORS[coverFileName];
      }
      return {
        primary: "rgb(225, 225, 235)",
        primaryRgb: "225, 225, 235",
        secondary: "rgb(150, 150, 170)",
        isMonochrome: true
      };
    }

    let bestBucket = null;
    let maxBucketScore = -1;
    for (const b of buckets) {
      if (b.count >= 8 && b.totalScore > maxBucketScore) {
        maxBucketScore = b.totalScore;
        bestBucket = b;
      }
    }

    if (!bestBucket) {
      if (coverFileName && TRACK_FALLBACK_COLORS[coverFileName]) {
        return TRACK_FALLBACK_COLORS[coverFileName];
      }
      return {
        primary: "rgb(225, 225, 235)",
        primaryRgb: "225, 225, 235",
        secondary: "rgb(150, 150, 170)",
        isMonochrome: true
      };
    }

    const avgR = Math.round(bestBucket.sumR / bestBucket.count);
    const avgG = Math.round(bestBucket.sumG / bestBucket.count);
    const avgB = Math.round(bestBucket.sumB / bestBucket.count);

    const hsl = rgbToHsl(avgR, avgG, avgB);
    hsl.l = Math.max(0.48, Math.min(0.72, hsl.l));
    hsl.s = Math.max(0.48, hsl.s);
    const [finalR, finalG, finalB] = hslToRgb(hsl.h, hsl.s, hsl.l);

    const sHsl = { ...hsl, h: (hsl.h + 0.08) % 1, l: Math.min(0.85, hsl.l + 0.15) };
    const [sR, sG, sB] = hslToRgb(sHsl.h, sHsl.s, sHsl.l);

    return {
      primary: `rgb(${finalR}, ${finalG}, ${finalB})`,
      primaryRgb: `${finalR}, ${finalG}, ${finalB}`,
      secondary: `rgb(${sR}, ${sG}, ${sB})`,
      isMonochrome: false
    };
  } catch (e) {
    return null;
  }
}

function extractCoverColor(imageSrc, coverFileName, callback) {
  if (coverColorCache.has(imageSrc)) {
    callback(coverColorCache.get(imageSrc));
    return;
  }

  const fallback = TRACK_FALLBACK_COLORS[coverFileName];
  if (fallback) {
    callback(fallback);
  }

  // Sample directly from rendered trackCover if available
  if (trackCover && trackCover.complete && trackCover.naturalWidth > 0 && trackCover.src.includes(coverFileName)) {
    const sampled = sampleImageElement(trackCover, coverFileName);
    if (sampled) {
      coverColorCache.set(imageSrc, sampled);
      callback(sampled);
      return;
    }
  }

  // Or load via Image without crossOrigin
  const img = new Image();
  img.onload = () => {
    const sampled = sampleImageElement(img, coverFileName);
    if (sampled) {
      coverColorCache.set(imageSrc, sampled);
      callback(sampled);
    } else if (fallback) {
      coverColorCache.set(imageSrc, fallback);
      callback(fallback);
    }
  };
  img.onerror = () => {
    if (fallback) {
      coverColorCache.set(imageSrc, fallback);
      callback(fallback);
    }
  };
  img.src = imageSrc;
}

function parseRgbNumbers(colorStr) {
  if (!colorStr) return null;
  const m = colorStr.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
  }
  return null;
}

function computeDarkBackgroundColors(rgbObj, isMonochrome) {
  if (isMonochrome) {
    // Ultra-dark charcoal/obsidian for B&W covers (Thelema, Tartan, Ghostemane) - max RGB ~18, even darker than default purple
    return {
      center: { r: 16, g: 17, b: 20 },
      mid: { r: 7, g: 7, b: 9 }
    };
  }
  const { h, s } = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
  const sat = Math.max(0.60, Math.min(0.85, s));

  // Exactly matching the darkness profile of default background #220835 (lightness: 0.10) and #0e0216 (lightness: 0.045)
  const centerRgb = hslToRgb(h, sat, 0.10);
  const midRgb = hslToRgb(h, sat, 0.045);

  return {
    center: { r: centerRgb[0], g: centerRgb[1], b: centerRgb[2] },
    mid: { r: midRgb[0], g: midRgb[1], b: midRgb[2] }
  };
}

let currentThemeAnimId = null;

// Track the live interpolated numeric color state for 60fps fluid transitions
let currentThemeState = {
  r1: 167, g1: 113, b1: 218,
  r2: 255, g2: 168, b2: 194,
  bgCenterR: 34, bgCenterG: 8, bgCenterB: 53, // exactly #220835
  bgMidR: 14, bgMidG: 2, bgMidB: 22            // exactly #0e0216
};

function animateThemeColors(targetState, duration = 550, onComplete = null) {
  if (currentThemeAnimId) {
    cancelAnimationFrame(currentThemeAnimId);
    currentThemeAnimId = null;
  }

  const startState = { ...currentThemeState };
  const startTime = performance.now();
  const root = document.documentElement;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Smooth cubic ease-out
    const ease = 1 - Math.pow(1 - progress, 3);

    currentThemeState.r1 = Math.round(startState.r1 + (targetState.r1 - startState.r1) * ease);
    currentThemeState.g1 = Math.round(startState.g1 + (targetState.g1 - startState.g1) * ease);
    currentThemeState.b1 = Math.round(startState.b1 + (targetState.b1 - startState.b1) * ease);

    currentThemeState.r2 = Math.round(startState.r2 + (targetState.r2 - startState.r2) * ease);
    currentThemeState.g2 = Math.round(startState.g2 + (targetState.g2 - startState.g2) * ease);
    currentThemeState.b2 = Math.round(startState.b2 + (targetState.b2 - startState.b2) * ease);

    currentThemeState.bgCenterR = Math.round(startState.bgCenterR + (targetState.bgCenterR - startState.bgCenterR) * ease);
    currentThemeState.bgCenterG = Math.round(startState.bgCenterG + (targetState.bgCenterG - startState.bgCenterG) * ease);
    currentThemeState.bgCenterB = Math.round(startState.bgCenterB + (targetState.bgCenterB - startState.bgCenterB) * ease);

    currentThemeState.bgMidR = Math.round(startState.bgMidR + (targetState.bgMidR - startState.bgMidR) * ease);
    currentThemeState.bgMidG = Math.round(startState.bgMidG + (targetState.bgMidG - startState.bgMidG) * ease);
    currentThemeState.bgMidB = Math.round(startState.bgMidB + (targetState.bgMidB - startState.bgMidB) * ease);

    const rgb1 = `${currentThemeState.r1}, ${currentThemeState.g1}, ${currentThemeState.b1}`;
    const col1 = `rgb(${rgb1})`;
    const col2 = `rgb(${currentThemeState.r2}, ${currentThemeState.g2}, ${currentThemeState.b2})`;

    const bgCenter = `rgb(${currentThemeState.bgCenterR}, ${currentThemeState.bgCenterG}, ${currentThemeState.bgCenterB})`;
    const bgMid = `rgb(${currentThemeState.bgMidR}, ${currentThemeState.bgMidG}, ${currentThemeState.bgMidB})`;

    root.style.setProperty("--first_color", col1);
    root.style.setProperty("--second_color", col2);
    root.style.setProperty("--first_color_rgb", rgb1);
    root.style.setProperty("--gradient", `linear-gradient(135deg, ${col1}, ${col2})`);
    root.style.setProperty("--track-color", col1);
    root.style.setProperty("--bg-center-color", bgCenter);
    root.style.setProperty("--bg-mid-color", bgMid);

    // Avatar hue-rotation & monochrome styling:
    // Base purple in avatar matrix background is ~300deg.
    if (targetState.isMonochrome) {
      root.style.setProperty("--avatar-filter", "grayscale(0.85) contrast(1.1)");
      root.style.setProperty("--avatar-hue-rotate", "0deg");
    } else {
      const hsl = rgbToHsl(currentThemeState.r1, currentThemeState.g1, currentThemeState.b1);
      if (hsl.s < 0.12) {
        root.style.setProperty("--avatar-filter", "grayscale(0.85) contrast(1.1)");
        root.style.setProperty("--avatar-hue-rotate", "0deg");
      } else {
        const trackHue = hsl.h * 360;
        let avatarHueRotate;
        if (trackHue >= 10 && trackHue <= 46) {
          // Warm brown / amber / bronze range:
          // In standard hue-rotate, pure 20-35deg on magenta looks neon red because of high lightness and missing green.
          // We shift rotation to warm golden-amber (~50deg) and tone down brightness to get rich authentic chocolate/amber brown.
          const brownTarget = 48 + ((trackHue - 10) / 36) * 8;
          avatarHueRotate = Math.round(brownTarget - 300 + 360);
          root.style.setProperty("--avatar-hue-rotate", `${avatarHueRotate}deg`);
          root.style.setProperty("--avatar-filter", `hue-rotate(${avatarHueRotate}deg) brightness(0.82) saturate(1.2)`);
        } else {
          avatarHueRotate = Math.round(trackHue - 300);
          if (avatarHueRotate > 180) avatarHueRotate -= 360;
          if (avatarHueRotate < -180) avatarHueRotate += 360;
          root.style.setProperty("--avatar-hue-rotate", `${avatarHueRotate}deg`);
          root.style.setProperty("--avatar-filter", `hue-rotate(${avatarHueRotate}deg)`);
        }
      }
    }

    window.matrixColor = col1;

    // Deep dark radial gradient matching the exact darkness profile of #220835 -> #0e0216 -> #000000
    const ambientGlow = `radial-gradient(circle at 50% 50%, ${bgCenter} 0%, ${bgMid} 55%, #000000 100%)`;
    root.style.setProperty("--music-ambient-glow", ambientGlow);
    document.body.style.setProperty("--music-ambient-glow", ambientGlow);

    if (progress < 1) {
      currentThemeAnimId = requestAnimationFrame(step);
    } else {
      currentThemeAnimId = null;
      if (typeof onComplete === "function") {
        onComplete();
      }
    }
  }

  currentThemeAnimId = requestAnimationFrame(step);
}

function applyCoverColors(colors) {
  if (!colors) return;

  const p1 = parseRgbNumbers(colors.primary) || parseRgbNumbers(colors.primaryRgb) || { r: 167, g: 113, b: 218 };
  const p2 = parseRgbNumbers(colors.secondary) || { r: Math.min(255, p1.r + 30), g: Math.min(255, p1.g + 30), b: Math.min(255, p1.b + 30) };

  // Generate deep dark background colors that never blind or wash out
  const darkBg = computeDarkBackgroundColors(p1, !!colors.isMonochrome);

  document.documentElement.classList.add("music-playing-theme");
  document.body.classList.add("music-playing-theme");

  animateThemeColors({
    r1: p1.r, g1: p1.g, b1: p1.b,
    r2: p2.r, g2: p2.g, b2: p2.b,
    bgCenterR: darkBg.center.r, bgCenterG: darkBg.center.g, bgCenterB: darkBg.center.b,
    bgMidR: darkBg.mid.r, bgMidG: darkBg.mid.g, bgMidB: darkBg.mid.b,
    isMonochrome: !!colors.isMonochrome
  }, 550);
}

function revertCoverColors() {
  const def1 = { r: 167, g: 113, b: 218 };
  const def2 = { r: 255, g: 168, b: 194 };
  const defCenter = { r: 34, g: 8, b: 53 };  // #220835
  const defMid = { r: 14, g: 2, b: 22 };      // #0e0216

  // Smoothly interpolate back to default palette and default #220835 / #0e0216 background
  animateThemeColors({
    r1: def1.r, g1: def1.g, b1: def1.b,
    r2: def2.r, g2: def2.g, b2: def2.b,
    bgCenterR: defCenter.r, bgCenterG: defCenter.g, bgCenterB: defCenter.b,
    bgMidR: defMid.r, bgMidG: defMid.g, bgMidB: defMid.b
  }, 450, () => {
    window.matrixColor = null;
    const root = document.documentElement;
    root.style.setProperty("--first_color", DEFAULT_COVER_PALETTE.first_color);
    root.style.setProperty("--second_color", DEFAULT_COVER_PALETTE.second_color);
    root.style.setProperty("--first_color_rgb", DEFAULT_COVER_PALETTE.first_color_rgb);
    root.style.setProperty("--gradient", DEFAULT_COVER_PALETTE.gradient);
    root.style.setProperty("--track-color", DEFAULT_COVER_PALETTE.track_color);
    root.style.setProperty("--bg-center-color", "#220835");
    root.style.setProperty("--bg-mid-color", "#0e0216");
    root.style.setProperty("--avatar-hue-rotate", "0deg");
    root.style.setProperty("--avatar-filter", "none");

    root.style.removeProperty("--music-ambient-glow");
    document.body.style.removeProperty("--music-ambient-glow");
    document.documentElement.classList.remove("music-playing-theme");
    document.body.classList.remove("music-playing-theme");
  });
}

function applyCurrentTrackColors() {
  const settings = window.getSiteSettings ? window.getSiteSettings() : { coverTheme: true };
  if (settings.coverTheme === false || audioElement.paused) {
    revertCoverColors();
    return;
  }

  const track = getCurrentTrack();
  if (!track) return;
  const coverFileName = track.cover || 'unknown-track.png';
  const coverSrc = `assets/player/covers/${coverFileName}`;

  extractCoverColor(coverSrc, coverFileName, (colors) => {
    if (!audioElement.paused && (!window.getSiteSettings || window.getSiteSettings().coverTheme !== false)) {
      applyCoverColors(colors);
    }
  });
}

window.applyCurrentTrackColors = applyCurrentTrackColors;
window.revertCoverColors = revertCoverColors;

// ===== CORE =====
function loadTrack(autoPlay = false) {
  let track = getCurrentTrack();

  const newSrc = audioFolder + track.file;
  const resolved = new URL(newSrc, window.location.href).href;
  if (audioElement.src !== resolved) {
    audioElement.src = newSrc;
  }

  updateTrackInfo();

  // **обновляем Media Session**
  updateMediaSession(track);

  if (autoPlay) {
    audioElement.play().catch(console.error);
  } else if (!audioElement.paused) {
    applyCurrentTrackColors();
  }
}


// ===== TIMERS =====
audioElement.addEventListener('timeupdate', () => {
  if (!audioElement.duration) return;

  // обновляем текст времени
  const c = audioElement.currentTime, d = audioElement.duration;
  const mc = Math.floor(c / 60), sc = Math.floor(c % 60);
  currentTimeSpan.textContent = `${mc < 10 ? '0' : ''}${mc}:${sc < 10 ? '0' : ''}${sc}`;

  if (d) {
    const md = Math.floor(d / 60), sd = Math.floor(d % 60);
    durationSpan.textContent = `${md < 10 ? '0' : ''}${md}:${sd < 10 ? '0' : ''}${sd}`;
  }

  // обновляем прогресс бар + слайдер
  updateProgress();
});

// === перемотка по слайдеру ===
seekSlider.addEventListener('input', () => {
  if (audioElement.duration) {
    const seekTime = (seekSlider.value / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
  }
});

function resetProgress() {
  seekSlider.value = 0;
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = '0%';
}

function updateProgress() {
  if (!audioElement.duration) return;

  const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;

  // обновляем слайдер
  seekSlider.value = progressPercent;

  // обновляем кастомный прогресс-бар (если у тебя есть)
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
}


audioElement.addEventListener('ended', () => {
  revertCoverColors();
  if (repeatTrack) {
    audioElement.currentTime = 0;
    audioElement.play();
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(true);
  }
});

audioElement.addEventListener('play', () => {
  if (playPauseIcon) playPauseIcon.src = 'assets/player/pause.svg';
  if (miniPlayPauseIcon) miniPlayPauseIcon.src = 'assets/player/pause.svg';
  audioPlayer?.classList.add('playing');

  applyCurrentTrackColors();

  try {
    initVisualizer();
  } catch (err) {
    console.warn("Visualizer init error:", err);
  }
});

audioElement.addEventListener('pause', () => {
  if (playPauseIcon) playPauseIcon.src = 'assets/player/play_arrow.svg';
  if (miniPlayPauseIcon) miniPlayPauseIcon.src = 'assets/player/play_arrow.svg';
  audioPlayer?.classList.remove('playing');
  revertCoverColors();
});

// ===== PLAYER CAPSULE EXPAND / COLLAPSE =====
function expandPlayer() {
  audioPlayer?.classList.add('expanded');
  document.body.classList.add('player-expanded');
}

function collapsePlayer() {
  audioPlayer?.classList.remove('expanded');
  document.body.classList.remove('player-expanded');
}

// Click on mini capsule (cover, info text, background) expands player
playerMini?.addEventListener('click', (e) => {
  if (e.target.closest('.mini-ctrl-btn')) return;
  expandPlayer();
});

// Controls inside mini capsule
miniPlayPause?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (audioElement.paused) audioElement.play().catch(console.error);
  else audioElement.pause();
});

miniPrevTrack?.addEventListener('click', (e) => {
  e.stopPropagation();
  prevTrackButton?.click();
});

miniNextTrack?.addEventListener('click', (e) => {
  e.stopPropagation();
  nextTrackButton?.click();
});

// Close button in expanded view
playerCloseBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  collapsePlayer();
});

// Backdrop click closes expanded view
playerBackdrop?.addEventListener('click', () => {
  collapsePlayer();
});

// Escape key closes expanded view
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && audioPlayer?.classList.contains('expanded')) {
    collapsePlayer();
  }
});

// ===== CONTROLS =====
playPauseBtn.addEventListener('click', () => {
  if (audioElement.paused) audioElement.play().catch(console.error);
  else audioElement.pause();
});

nextTrackButton.addEventListener('click', () => {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;;
  loadTrack(true);
  resetProgress();
});

prevTrackButton.addEventListener('click', () => {
  if (audioElement.currentTime > 5 && !audioElement.paused) {
    audioElement.currentTime = 0;
    updateTrackInfo();
  } else {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(true);
  }
  resetProgress();
});

volumeInput.addEventListener('input', () => { audioElement.volume = volumeInput.value; });

// ===== AUDIO VISUALIZER (реально только бас) =====
let audioCtx, analyser, source, filter, dataArray;

function initVisualizer() {
  if (audioCtx) return; // уже инициализировано

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audioElement);

  // фильтр для анализа
  filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 50;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  // звук в колонки
  source.connect(audioCtx.destination);

  // фильтр → анализатор (только для визуализации)
  source.connect(filter);
  filter.connect(analyser);

  animateCover();      // анимация обложки
}

function animateCover() {
  requestAnimationFrame(animateCover);

  if (!analyser) return;
  analyser.getByteFrequencyData(dataArray);

  // берём только низкие частоты (бас)
  const bassBins = 5; // можно подбирать
  let sum = 0;
  for (let i = 0; i < bassBins; i++) {
    sum += dataArray[i];
  }
  const bass = sum / bassBins; // средний уровень баса 0-255

  const amplified = bass * 2;
  const scale = 1 + (amplified / 256) * 0.1;

  if (trackCover) {
    trackCover.style.transform = `scale(${scale})`;
  }

  // если хочешь фон тоже под бас
  // bgCircles.forEach(circle => {
  //   const brightnessFactor = 0.3 + (bass / 255) * 8.7;
  //   circle.style.filter = `brightness(${brightnessFactor})`;
  // });
}


function updateMediaSession(track) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.author || 'Unknown',
      album: 'ShampurRadio',
      artwork: [
        { src: track.cover ? `assets/radio/covers/${track.cover}` : 'assets/radio/covers/unknown-track.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => audioElement.play());
    navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrackButton.click());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrackButton.click());

    // Ползунок перемотки
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.fastSeek && 'fastSeek' in audioElement) {
        audioElement.fastSeek(details.seekTime);
        return;
      }
      audioElement.currentTime = details.seekTime;
    });
  }
}

// Чтение трека из URL или случайный
const fromURL = parseInt(new URLSearchParams(window.location.search).get('track'));
currentTrackIndex = (fromURL >= 0 && fromURL < tracks.length)
  ? fromURL
  : Math.floor(Math.random() * tracks.length);

const track = getCurrentTrack();
loadTrack(false);

function getNextTrackIndex(forward = true) {
  let newIndex = currentTrackIndex;
  let tries = 0;

  newIndex = forward
    ? (newIndex + 1) % tracks.length
    : (newIndex - 1 + tracks.length) % tracks.length;
  tries++;
  if (tries > tracks.length) return currentTrackIndex; // все explicit

  return newIndex;
}

const openTracklistBtn = document.getElementById('openTracklistBtn');
const tracklistModal = document.getElementById('tracklistModal');
const tracklistClose = document.getElementById('tracklistModalClose');
const tracklistContainer = document.getElementById('tracklistContainer');

// Play по кнопке на обложке
tracks.forEach((track, index) => {
  const item = document.createElement('div');
  item.className = 'tracklist-item';

  item.innerHTML = `
  <div class="tracklist-cover-wrapper">
    <img src="assets/covers/${track.cover || 'unknown-track.png'}" alt="${track.title}" class="tracklist-cover">
    <div class="tracklist-play-btn-overlay">▶</div>
  </div>
  <div class="tracklist-info">
    <span class="tracklist-title">${track.title}</span>
    <span class="tracklist-author">${track.author || ''}</span>
  </div>
  <div class="tracklist-buttons">
    <button class="tracklist-like-btn">❤</button>
    <button class="tracklist-share-btn">🔗</button>
  </div>
`;

  item.querySelector('.tracklist-like-btn').addEventListener('click', e => {
    e.stopPropagation();
    if (likedTracks.includes(index)) likedTracks = likedTracks.filter(x => x !== index);
    else likedTracks.push(index);
    saveSettings();
    showNotification(likeNotification, likedTracks.includes(index) ? 'Вы лайкнули трек' : 'Трек больше не лайкнут');
  });

  item.querySelector('.tracklist-share-btn').addEventListener('click', e => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}?track=${index}`;
    navigator.clipboard.writeText(link).then(() => showNotification(copyNotification, `Ссылка на трек #${index} скопирована!`));
  });

  const playBtn = item.querySelector('.tracklist-play-btn-overlay');
  playBtn.addEventListener('click', (e) => { // <- e здесь
    e.stopPropagation();                     // предотвращаем всплытие
    currentTrackIndex = index;               // ставим трек
    loadTrack(true);                          // начинаем воспроизведение
    closeTracklistModal();                    // закрываем модалку
  });

  tracklistContainer.appendChild(item);
});

function closeTracklistModal() {
  tracklistModal.classList.remove('active');
  tracklistModal.style.display = 'none'; // <- принудительно скрываем
}

openTracklistBtn.addEventListener('click', () => {
  tracklistModal.style.display = 'flex';
  requestAnimationFrame(() => tracklistModal.classList.add('active'));
});

tracklistClose.addEventListener('click', () => {
  closeTracklistModal();
});

tracklistModal.addEventListener('click', e => {
  if (e.target === tracklistModal) closeTracklistModal();
});