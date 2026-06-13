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
    { 
      file: "track4.flac",
      title: "Tartan",
      author: "EsDeeKid, Fimiguerrero",
      cover: "track4.jpg"
    },
    { 
      file: "track5.flac",
      title: "1-800",
      author: "bbno$, ironmouse",
      cover: "track5.jpg"
    },
    { 
      file: "track6.flac",
      title: "jessie",
      author: "Riserayss, LONOWN",
      cover: "track6.jpg"
    },
    { 
      file: "track7.flac",
      title: "Thelema (Slowed)",
      author: "Øfdream",
      cover: "track7.jpg"
    }
]

// ===== CONFIG =====
const audioFolder = './assets/player/audio/';
let currentTrackIndex = 0;
let currentPlaylist = "radio";

// ===== DOM =====
let styleElements = [];
const originalStyles = new Map();

const seekSlider       = document.getElementById('seekSlider');
const audioElement     = document.getElementById('audio');
const prevTrackButton  = document.getElementById('prevTrack');
const playPauseBtn     = document.getElementById('playPause');
const nextTrackButton  = document.getElementById('nextTrack');
const volumeInput      = document.getElementById('volume');
const currentTimeSpan  = document.getElementById('currentTime');
const durationSpan     = document.getElementById('duration');
const trackTitleSpan   = document.getElementById('trackTitle');
const trackAuthorSpan  = document.getElementById('trackAuthor');
const playPauseIcon    = document.getElementById('playPauseIcon');
const trackIDSpan      = document.getElementById('trackID');
const trackCover       = document.getElementById('trackCover');
const likeButton       = document.getElementById('likeButton');


audioElement.volume = 0.25;
volumeInput.value = 0.25;
repeatTrack = false;
// ===== UTILS =====

function getCurrentTrack(){
  return tracks[currentTrackIndex];
}

function startPlayback() {
  loadTrack(true);
  audioElement.play().catch(console.error);
}

document.addEventListener('click', startPlayback, { once: true });

function updateTrackInfo(){
  const track = getCurrentTrack();
  trackTitleSpan.textContent = track.title;
  trackAuthorSpan.textContent = track.author || '';
  trackCover.src = track.cover ? `assets/player/covers/${track.cover}` : 'assets/player/covers/unknown-track.png';

}

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

  if(autoPlay){
    audioElement.play().catch(console.error);
  }

  // applyVibeStyles?.();
//   applyTrackColors(track);
}


// ===== TIMERS =====
audioElement.addEventListener('timeupdate', () => {
  if (!audioElement.duration) return;

  // обновляем текст времени
  const c = audioElement.currentTime, d = audioElement.duration;
  const mc = Math.floor(c / 60), sc = Math.floor(c % 60);
  currentTimeSpan.textContent = `${mc<10?'0':''}${mc}:${sc<10?'0':''}${sc}`;

  if (d) {
    const md = Math.floor(d / 60), sd = Math.floor(d % 60);
    durationSpan.textContent = `${md<10?'0':''}${md}:${sd<10?'0':''}${sd}`;
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
  if (repeatTrack) {
    audioElement.currentTime = 0;
    audioElement.play();
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(true);
  }
});

audioElement.addEventListener('play', () => {
  playPauseIcon.src = 'assets/player/pause.svg';
  initVisualizer();
});

audioElement.addEventListener('pause',()=>playPauseIcon.src='assets/player/play_arrow.svg');

// ===== CONTROLS =====
playPauseBtn.addEventListener('click',()=>{
  if(audioElement.paused) audioElement.play().catch(console.error);
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

volumeInput.addEventListener('input',()=>{audioElement.volume=volumeInput.value;});

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

  animateCover();      // твоя анимация обложки
  animateBgCircles();  // новая анимация кругов фона
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
      loadTrack(true);

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
  if(likedTracks.includes(index)) likedTracks = likedTracks.filter(x => x !== index);
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