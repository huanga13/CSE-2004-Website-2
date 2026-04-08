const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input");

// playing the piano
let allKeys = [],
audio = new Audio(`assets/a.wav`);
const playTune = (key) => {
    audio.src = `assets/tunes/${key}.wav`;
    audio.play();
    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => {
        clickedKey.classList.remove("active");
    }, 150);
}
pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key);
    key.addEventListener("click", () => playTune(key.dataset.key));
});
const pressedKey = (e) => {
    if(allKeys.includes(e.key)) playTune(e.key);
}
document.addEventListener("keydown", pressedKey);

// speech bubble
const speechText = document.getElementById("speech-text");
const micBtn = document.getElementById("mic-btn");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isListening = false;
let currentText = "";

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            let transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        currentText += finalTranscript;

        speechText.innerText = currentText + interimTranscript;

        if (speechText.scrollHeight > speechText.clientHeight) {
            currentText = finalTranscript;
            speechText.innerText = currentText;
        }
    };
    recognition.onend = () => {
        if (isListening) recognition.start();
    };
}

micBtn.addEventListener("click", () => {
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser");
        return;
    }

    if (!isListening) {
        recognition.start();
        micBtn.innerText = "⏹";
        isListening = true;
    } else {
        recognition.stop();
        micBtn.innerText = "🎙️";
        isListening = false;
    }
});

// iTunes api
async function loadTopITunesSongs() {
    const listEl = document.getElementById("itunes-songs");

    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url='; // to avoid CORS and iTunes
        const targetUrl = 'https://itunes.apple.com/search?term=classical+piano&media=music&limit=3';
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

        const data = await response.json();

        listEl.innerHTML = "";

        data.results.forEach(song => {
            const li = document.createElement("li");
            li.innerHTML = `
                <a href="${song.trackViewUrl}" target="_blank">
                    <img src="${song.artworkUrl60}" alt="album art">
                    ${song.trackName} — <i>${song.artistName}</i>
                </a>
            `;
            listEl.appendChild(li);
        });

    } catch (err) {
        console.error(err);
        listEl.innerHTML = "<li>Failed to load songs.</li>";
    }
}

loadTopITunesSongs();
