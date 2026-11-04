const selectionScreen = document.querySelector("#selection-screen");
const timerScreen = document.querySelector("#timer-screen");
const timerKicker = document.querySelector("#timer-kicker");
const timerTitle = document.querySelector("#timer-title");
const timerMessage = document.querySelector("#timer-message");
const clockTime = document.querySelector("#clock-time");
const clockProgress = document.querySelector("#clock-progress");
const boilButton = document.querySelector("#boil-button");
const cancelButton = document.querySelector("#cancel-button");
const backButton = document.querySelector("#back-button");
const eggCards = document.querySelectorAll(".egg-card");

const timer = {
  intervalId: null,
  endTime: 0,
  heatingStart: 0,
  duration: 0,
  phase: "heating",
  method: "boiling",
};

let audioContext;

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function prepareAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  audioContext ??= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return true;
}

function playChime() {
  if (!prepareAudio()) return;

  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.18;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.56);
  });
}

function finishTimer() {
  if (timer.intervalId === null) return;

  window.clearInterval(timer.intervalId);
  timer.intervalId = null;
  timerScreen.classList.add("finished");
  timerMessage.textContent = "Time's up! Your eggs are ready.";
  boilButton.hidden = true;
  cancelButton.hidden = true;
  backButton.hidden = false;
  playChime();
}

function updateClock() {
  if (timer.phase === "heating") {
    clockTime.textContent = formatTime(Date.now() - timer.heatingStart);
    clockProgress.style.strokeDashoffset = "100";
    return;
  }

  const remaining = Math.max(0, timer.endTime - Date.now());
  const progress = 100 * (1 - remaining / timer.duration);
  clockTime.textContent = formatTime(remaining);
  clockProgress.style.strokeDashoffset = String(progress);

  if (remaining === 0) finishTimer();
}

function startTimer(recipe) {
  if (timer.intervalId !== null) window.clearInterval(timer.intervalId);

  timer.duration = Number(recipe.dataset.minutes) * 60 * 1000;
  timer.heatingStart = Date.now();
  timer.phase = "heating";
  timer.method = recipe.dataset.method;

  prepareAudio();
  timerTitle.textContent = recipe.dataset.name;
  timerKicker.textContent = "Heating water";
  timerMessage.textContent = timer.method === "cold"
    ? "Put the egg in cold water covering it by no more than about 1 mm, then switch on the stove."
    : "Clock started. Heat the water; add the egg when it boils, then start the cooking timer.";
  timerScreen.classList.remove("finished");
  timerScreen.classList.add("active");
  selectionScreen.classList.add("hidden");

  boilButton.hidden = false;
  boilButton.textContent = timer.method === "cold"
    ? "First bubbles — remove pan"
    : "Eggs in water — start timer";
  cancelButton.hidden = false;
  backButton.hidden = true;

  updateClock();
  timer.intervalId = window.setInterval(updateClock, 250);
}

function startCookingPhase() {
  if (timer.phase !== "heating") return;

  timer.phase = "cooking";
  timer.endTime = Date.now() + timer.duration;
  timerKicker.textContent = timer.method === "cold" ? "Cold-water finish" : "Cooking";
  timerMessage.textContent = timer.method === "cold"
    ? "Remove the pan from heat. The six-minute timer starts now."
    : `Start timing now, after adding the egg to boiling water (${timer.duration / 60000} minutes).`;
  boilButton.hidden = true;
  updateClock();
}

function returnToSelection() {
  if (timer.intervalId !== null) {
    window.clearInterval(timer.intervalId);
    timer.intervalId = null;
  }

  timerScreen.classList.remove("active", "finished");
  selectionScreen.classList.remove("hidden");
  document.querySelector("#page-title").focus();
}

eggCards.forEach((card) => {
  card.addEventListener("click", () => startTimer(card));
});

boilButton.addEventListener("click", startCookingPhase);
cancelButton.addEventListener("click", returnToSelection);
backButton.addEventListener("click", returnToSelection);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && timer.intervalId !== null) updateClock();
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
