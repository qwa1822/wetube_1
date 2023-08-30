console.log("video Player");

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
let volumeValue = 0.5;
video.volume = volumeValue;
let controlsTimeout = null;
let controlsMovementTimeout = null;

const handlePlayClick = e => {
  // if the video is playing, pause it

  video.paused ? video.play() : video.pause();
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  // else play the video
};

const handleMuteClick = e => {
  video.muted
    ? ((video.muted = false),
      (muteBtn.textContent = "muted"),
      (video.volume = 0.5),
      (volumeRange.value = 0.5))
    : ((video.muted = true),
      (muteBtn.textContent = "unmute"),
      (video.volume = 0),
      (volumeRange.value = 0));
  muteBtn.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handlePause = () => {
  playBtn.textContent = "play";
};

const handlePlay = () => {
  playBtn.textContent = "pause";
};

const handleVolumeChange = e => {
  const {
    target: { value },
  } = e;

  if (video.muted) {
    video.muted = false;
    muteBtn.textContent = "mute";
  }
  volumeValue = value;

  video.volume = value;
};

const formatTime = seconds => {
  const newDate = new Date(seconds * 1000).toISOString().substring(14, 19);
  console.log(newDate);
  return newDate;
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = e => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};
window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    handlePlayClick();
  }

  console.log(play);
  if (e.code === "Enter") {
    handlePlayClick();
  }
  if (e.code === "ArrowRight") {
    video.currentTime += 2;
  }
  if (e.code === "ArrowLeft") {
    video.currentTime -= 2;
  }
});

const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement;

  if (fullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");

  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
  console.log(controlsTimeout);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;

  console.log(id);
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
