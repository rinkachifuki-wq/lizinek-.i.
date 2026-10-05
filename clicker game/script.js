const loveMessages = [
    { language: "Angol", phrase: "I love you" },
    { language: "Magyar", phrase: "Szeretlek" },
    { language: "Spanyol", phrase: "Te quiero" },
    { language: "Francia", phrase: "Je t'aime" },
    { language: "Olasz", phrase: "Ti amo" },
    { language: "Német", phrase: "Ich liebe dich" },
    { language: "Portugál", phrase: "Eu te amo" },
    { language: "Japán", phrase: "愛してる" },
    { language: "Koreai", phrase: "사랑해" },
    { language: "Holland", phrase: "Ik hou van jou" }
];

let hearts = 0;
let audioContext;

const heartCount = document.getElementById("heartCount");
const heartButton = document.getElementById("heartButton");
const heartRain = document.getElementById("heartRain");
const loveMessage = document.getElementById("loveMessage");
const messageLanguage = document.getElementById("messageLanguage");
const messagePhrase = document.getElementById("messagePhrase");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");
const finishOverlay = document.getElementById("finishOverlay");
const againButton = document.getElementById("againButton");

function makeHeartBurst() {
    for (let index = 0; index < 10; index++) {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.setAttribute("aria-hidden", "true");
        heart.textContent = "♥";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.fontSize = `${18 + Math.random() * 25}px`;
        heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 150}px`);
        heart.style.setProperty("--float-y", `${-60 - Math.random() * 150}px`);
        heart.style.setProperty("--spin", `${(Math.random() - 0.5) * 80}deg`);
        heart.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
        heart.style.animationDelay = `${Math.random() * 180}ms`;
        heartRain.appendChild(heart);
        heart.addEventListener("animationend", function() {
            heart.remove();
        });
    }
}

function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
}

function playKissSound() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const noise = context.createBufferSource();
    const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.05), context.sampleRate);
    const noiseFilter = context.createBiquadFilter();
    const noiseVolume = context.createGain();
    const noiseSamples = noiseBuffer.getChannelData(0);

    for (let index = 0; index < noiseSamples.length; index++) {
        noiseSamples[index] = (Math.random() * 2 - 1) * (1 - index / noiseSamples.length);
    }

    noise.buffer = noiseBuffer;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.Q.setValueAtTime(0.8, now);
    noiseVolume.gain.setValueAtTime(0.0001, now);
    noiseVolume.gain.exponentialRampToValueAtTime(0.055, now + 0.004);
    noiseVolume.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseVolume);
    noiseVolume.connect(context.destination);
    noise.start(now);
    noise.stop(now + 0.05);

    const tone = context.createOscillator();
    const toneVolume = context.createGain();
    tone.type = "sine";
    tone.frequency.setValueAtTime(440, now);
    tone.frequency.exponentialRampToValueAtTime(270, now + 0.11);
    toneVolume.gain.setValueAtTime(0.0001, now);
    toneVolume.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
    toneVolume.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    tone.connect(toneVolume);
    toneVolume.connect(context.destination);
    tone.start(now);
    tone.stop(now + 0.12);
}

function playLoveSong() {
    const context = getAudioContext();
    if (!context) return;

    const notes = [659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25, 523.25];
    const firstNote = context.currentTime + 0.08;

    notes.forEach(function(frequency, index) {
        const noteStart = firstNote + index * 0.24;
        const oscillator = context.createOscillator();
        const volume = context.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        volume.gain.setValueAtTime(0.0001, noteStart);
        volume.gain.exponentialRampToValueAtTime(0.11, noteStart + 0.025);
        volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.22);
    });
}

function celebrate() {
    finishOverlay.hidden = false;
    heartButton.disabled = true;
    playLoveSong();
    againButton.focus();
}

heartButton.addEventListener("click", function() {
    if (hearts >= loveMessages.length) return;

    playKissSound();
    hearts++;
    heartCount.textContent = hearts;
    progressTrack.setAttribute("aria-valuenow", hearts);
    progressFill.style.width = `${hearts * 10}%`;

    const message = loveMessages[hearts - 1];
    messageLanguage.textContent = message.language;
    messagePhrase.textContent = message.phrase;

    loveMessage.classList.remove("message-pop");
    void loveMessage.offsetWidth;
    loveMessage.classList.add("message-pop");
    heartButton.classList.remove("heart-pop");
    void heartButton.offsetWidth;
    heartButton.classList.add("heart-pop");
    makeHeartBurst();

    if (hearts === loveMessages.length) celebrate();
});

againButton.addEventListener("click", function() {
    window.location.reload();
});