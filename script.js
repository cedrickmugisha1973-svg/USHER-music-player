
const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const playButton = document.getElementById("play");
const disc = document.getElementById("disc");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const songList = document.getElementById("songList");

let songs = [];
let currentIndex = -1;
let repeat = false;
let activeUrl = null;

// Add music from the computer.
fileInput.addEventListener("change", event => {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    if (!file.type.startsWith("audio/")) return;

    songs.push({
      name: file.name.replace(/\.[^/.]+$/, ""),
      file,
      url: URL.createObjectURL(file)
    });
  });

  renderSongs();

  // Automatically load the first song.
  if (currentIndex === -1 && songs.length > 0) {
    loadSong(0);
  }

  fileInput.value = "";
});

// Display the playlist.
function renderSongs() {
  songList.replaceChildren();

  if (songs.length === 0) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent =
      "Click Add Music to choose songs from your computer.";
    songList.appendChild(message);
    return;
  }

  songs.forEach((song, index) => {
    const row = document.createElement("div");
    row.className = "song";

    if (index === currentIndex) {
      row.classList.add("active");
    }

    const icon = document.createElement("span");
    icon.className = "song-icon";
    icon.textContent = index === currentIndex && !audio.paused
      ? "♫"
      : "♪";

    const info = document.createElement("div");
    info.className = "song-info";

    const title = document.createElement("strong");
    title.textContent = song.name;

    const artist = document.createElement("small");
    artist.textContent = "USHER DJ • Local Track";

    info.append(title, artist);
    row.append(icon, info);

    row.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });

    songList.appendChild(row);
  });
}

// Load a selected song.
function loadSong(index) {
  if (index < 0 || index >= songs.length) return;

  audio.pause();
  currentIndex = index;

  audio.src = songs[index].url;
  audio.load();

  document.getElementById("songTitle").textContent =
    songs[index].name;

  document.getElementById("artist").textContent =
    "USHER DJ • NOW PLAYING";

  progress.value = 0;
  document.getElementById("currentTime").textContent = "00:00";
  document.getElementById("duration").textContent = "00:00";

  playButton.textContent = "▶";
  disc.classList.remove("spinning");

  renderSongs();
}

// Play music.
async function playSong() {
  if (currentIndex === -1) {
    if (songs.length === 0) {
      fileInput.click();
      return;
    }

    loadSong(0);
  }

  try {
    await audio.play();
    playButton.textContent = "Ⅱ";
    disc.classList.add("spinning");
    renderSongs();
  } catch (error) {
    console.error("Could not play this song:", error);
    document.getElementById("artist").textContent =
      "Unable to play this audio file.";
  }
}

// Play and pause.
playButton.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    audio.pause();
  }
});

audio.addEventListener("play", () => {
  playButton.textContent = "Ⅱ";
  disc.classList.add("spinning");
  renderSongs();
});

audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  disc.classList.remove("spinning");
  renderSongs();
});

// Previous song.
document.getElementById("previous").addEventListener("click", () => {
  if (songs.length === 0) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    loadSong((currentIndex - 1 + songs.length) % songs.length);
    playSong();
  }
});

// Next song.
document.getElementById("next").addEventListener("click", () => {
  if (songs.length === 0) return;

  loadSong((currentIndex + 1) % songs.length);
  playSong();
});

// Automatically play the next song when one ends.
audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    playSong();
  } else if (currentIndex < songs.length - 1) {
    loadSong(currentIndex + 1);
    playSong();
  } else {
    playButton.textContent = "▶";
    disc.classList.remove("spinning");
  }
});

// Repeat current song.
document.getElementById("repeat").addEventListener("click", event => {
  repeat = !repeat;
  event.currentTarget.textContent =
    repeat ? "↻ Repeat: On" : "↻ Repeat: Off";
  audio.loop = repeat;
});

// Volume control.
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value) / 100;
});

audio.volume = Number(volume.value) / 100;

// Update the progress bar as music plays.
audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
    progress.value = 0;
    return;
  }

  progress.value = (audio.currentTime / audio.duration) * 100;

  document.getElementById("currentTime").textContent =
    formatTime(audio.currentTime);

  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

// Seek to another part of the song.
progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime =
      (Number(progress.value) / 100) * audio.duration;
  }
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}
