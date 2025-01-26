
/* This code creates an interactive music application using p5.js and ml5.js, where users can control music playback based on real-time image classification and hand gestures.

The program uses a webcam feed to detect specific hand positions over predefined areas on the screen, which correspond to different musical elements. It utilizes two machine learning models from Teachable Machine: one for genre selection (Pop, Hiphop, or Rock) and another for activating individual sound samples (drums, bass, lead, or vocals).

Once a genre is selected, the program adjusts the volume of the associated sound samples dynamically, allowing users to mix tracks interactively by positioning their hands over the detection areas. Sounds fade in and out smoothly as labels are detected, creating a seamless music-mixing experience. */

let genreClassifier;
let otherClassifier;
let video;
let labels = ["None", "None", "None", "None", "None"];
let fadeSpeed = 0.05;
let classificationInterval = 1000; // Reduced interval to 1 second

// Individual sound variables for Pop, Hiphop, and Rock genres
let pop_drums_1, pop_drums_2, pop_drums_3;
let pop_bass_1, pop_bass_2, pop_bass_3;
let pop_lead_1, pop_lead_2, pop_lead_3;
let pop_vox_1, pop_vox_2, pop_vox_3;

let hp_drums_1, hp_drums_2, hp_drums_3;
let hp_bass_1, hp_bass_2, hp_bass_3;
let hp_lead_1, hp_lead_2, hp_lead_3;
let hp_vox_1, hp_vox_2, hp_vox_3;

let rock_drums_1, rock_drums_2, rock_drums_3;
let rock_bass_1, rock_bass_2, rock_bass_3;
let rock_lead_1, rock_lead_2, rock_lead_3;
let rock_vox_1, rock_vox_2, rock_vox_3;

const areaWidth = 120;
const areaHeight = 120;
const margin = areaWidth / 4;
const topMargin = 40;

let detectionAreas = [
  { x: (640 - areaWidth) / 2, y: topMargin, w: areaWidth, h: areaHeight },   // Genre selection area (centered at the top with margin)
  { x: margin, y: 240, w: areaWidth, h: areaHeight },  // First detection area in the second row
  { x: margin * 2 + areaWidth, y: 240, w: areaWidth, h: areaHeight }, // Second detection area in the second row
  { x: margin * 3 + areaWidth * 2, y: 240, w: areaWidth, h: areaHeight }, // Third detection area in the second row
  { x: margin * 4 + areaWidth * 3, y: 240, w: areaWidth, h: areaHeight }  // Fourth detection area in the second row
];

// Track names for displaying
let tracks = ["", "", "", "", ""];

let isGenreModelReady = false; // Flag to track genre model readiness
let isOtherModelReady = false; // Flag to track other model readiness
let selectedGenre = "None"; // Variable to store selected genre

function preload() {
  console.log("Preloading sounds...");

  // Load Pop sound files and start looping them
  pop_drums_1 = loadSound("pop_drums_1.wav", () => pop_drums_1.loop());
  pop_drums_2 = loadSound("pop_drums_2.wav", () => pop_drums_2.loop());
  pop_drums_3 = loadSound("pop_drums_3.wav", () => pop_drums_3.loop());
  pop_bass_1 = loadSound("pop_bass_1.wav", () => pop_bass_1.loop());
  pop_bass_2 = loadSound("pop_bass_2.wav", () => pop_bass_2.loop());
  pop_bass_3 = loadSound("pop_bass_3.wav", () => pop_bass_3.loop());
  pop_lead_1 = loadSound("pop_lead_1.wav", () => pop_lead_1.loop());
  pop_lead_2 = loadSound("pop_lead_2.wav", () => pop_lead_2.loop());
  pop_lead_3 = loadSound("pop_lead_3.wav", () => pop_lead_3.loop());
  pop_vox_1 = loadSound("pop_vox_1.wav", () => pop_vox_1.loop());
  pop_vox_2 = loadSound("pop_vox_2.wav", () => pop_vox_2.loop());
  pop_vox_3 = loadSound("pop_vox_3.wav", () => pop_vox_3.loop());

  // Load Hiphop sound files and start looping them
  hp_drums_1 = loadSound("hp_drums_1.wav", () => hp_drums_1.loop());
  hp_drums_2 = loadSound("hp_drums_2.wav", () => hp_drums_2.loop());
  hp_drums_3 = loadSound("hp_drums_3.wav", () => hp_drums_3.loop());
  hp_bass_1 = loadSound("hp_bass_1.wav", () => hp_bass_1.loop());
  hp_bass_2 = loadSound("hp_bass_2.wav", () => hp_bass_2.loop());
  hp_bass_3 = loadSound("hp_bass_3.wav", () => hp_bass_3.loop());
  hp_lead_1 = loadSound("hp_lead_1.wav", () => hp_lead_1.loop());
  hp_lead_2 = loadSound("hp_lead_2.wav", () => hp_lead_2.loop());
  hp_lead_3 = loadSound("hp_lead_3.wav", () => hp_lead_3.loop());
  hp_vox_1 = loadSound("hp_vox_1.wav", () => hp_vox_1.loop());
  hp_vox_2 = loadSound("hp_vox_2.wav", () => hp_vox_2.loop());
  hp_vox_3 = loadSound("hp_vox_3.wav", () => hp_vox_3.loop());

  // Load Rock sound files and start looping them
  rock_drums_1 = loadSound("rock_drums_1.wav", () => rock_drums_1.loop());
  rock_drums_2 = loadSound("rock_drums_2.wav", () => rock_drums_2.loop());
  rock_drums_3 = loadSound("rock_drums_3.wav", () => rock_drums_3.loop());
  rock_bass_1 = loadSound("rock_bass_1.wav", () => rock_bass_1.loop());
  rock_bass_2 = loadSound("rock_bass_2.wav", () => rock_bass_2.loop());
  rock_bass_3 = loadSound("rock_bass_3.wav", () => rock_bass_3.loop());
  rock_lead_1 = loadSound("rock_lead_1.wav", () => rock_lead_1.loop());
  rock_lead_2 = loadSound("rock_lead_2.wav", () => rock_lead_2.loop());
  rock_lead_3 = loadSound("rock_lead_3.wav", () => rock_lead_3.loop());
  rock_vox_1 = loadSound("rock_vox_1.wav", () => rock_vox_1.loop());
  rock_vox_2 = loadSound("rock_vox_2.wav", () => rock_vox_2.loop());
  rock_vox_3 = loadSound("rock_vox_3.wav", () => rock_vox_3.loop());

  console.log("Loading models...");
  // Load the genre classifier model and set the flag once it is ready
  genreClassifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/PIc9izgjc/", function() {
    isGenreModelReady = true; // Set the flag to true when genre model is loaded
    console.log('Genre Model Loaded!');
  });

  // Load the other classifier model and set the flag once it is ready
  otherClassifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/pPw9sxfqc/", function() {
    isOtherModelReady = true; // Set the flag to true when other model is loaded
    console.log('Other Model Loaded!');
  });

  setInitialVolumes();
}

function setInitialVolumes() {
  console.log('Setting volumes...');
  // Set initial volume for all sounds to 0
  let sounds = [
    pop_drums_1, pop_drums_2, pop_drums_3,
    pop_bass_1, pop_bass_2, pop_bass_3,
    pop_lead_1, pop_lead_2, pop_lead_3,
    pop_vox_1, pop_vox_2, pop_vox_3,
    hp_drums_1, hp_drums_2, hp_drums_3,
    hp_bass_1, hp_bass_2, hp_bass_3,
    hp_lead_1, hp_lead_2, hp_lead_3,
    hp_vox_1, hp_vox_2, hp_vox_3,
    rock_drums_1, rock_drums_2, rock_drums_3,
    rock_bass_1, rock_bass_2, rock_bass_3,
    rock_lead_1, rock_lead_2, rock_lead_3,
    rock_vox_1, rock_vox_2, rock_vox_3
  ];

  for (let i = 0; i < sounds.length; i++) {
     sounds[i].setVolume(0);
  }

  console.log('Volumes set.');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Check if the models are ready, start classification once video is loaded
  video.elt.onloadeddata = function() {
    console.log("Video loaded.");
    checkModelsAndClassify();
  };
}

function checkModelsAndClassify() {
  if (isGenreModelReady && isOtherModelReady) {
    console.log("Models are ready. Starting classification.");
    // Start classification for each area once models are loaded
    classifyArea(0, genreClassifier); // Genre area
    for (let i = 1; i < detectionAreas.length; i++) {
      classifyArea(i, otherClassifier); // Other areas
    }
  } else {
    console.log("Models are not ready. Retrying...");
    setTimeout(checkModelsAndClassify, 100); // Retry after a short delay
  }
}

async function classifyArea(areaIndex, classifier) {
  if (video) {
    var area = detectionAreas[areaIndex];
    var detectionImg = video.get(area.x, area.y, area.w, area.h);
    console.log(`Classifying area ${areaIndex}...`);

    try {
      const results = await classifier.classify(detectionImg);

      if (results && results[0]) {
        labels[areaIndex] = results[0].label;
        tracks[areaIndex] = results[0].label;
        console.log(`Area ${areaIndex}: ${results[0].label}`);
      } else {
        console.log(`Area ${areaIndex}: No results`);
      }
    } catch (error) {
      console.error(`Error classifying area ${areaIndex}:`, error);
    }
  } else {
    console.log("Video not ready");
    labels[areaIndex] = "None";
    tracks[areaIndex] = "";
  }

  // Update the selected genre based on the first detection area
  if (areaIndex === 0) {
    selectedGenre = labels[0];
  }

  setTimeout(() => classifyArea(areaIndex, classifier), classificationInterval);
}

function draw() {
  image(video, 0, 0);

  for (let i = 0; i < detectionAreas.length; i++) {
    let area = detectionAreas[i];
    let label = labels[i];
    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    rect(area.x, area.y, area.w, area.h);

    if (label) {
      noStroke();
      fill(255);
      textSize(16);
      text(label, area.x + 10, area.y + 20);
    }
  }

  // Display selected genre on canvas
  textSize(24);
  fill(255);
  textAlign(CENTER, CENTER);
  text(`Selected Genre: ${selectedGenre}`, width / 2, height - 20);

  adjustVolumes();
}

function adjustVolumes() {
  // Arrays of sound samples for Pop, Hiphop, and Rock genres
  let pop_drums = [pop_drums_1, pop_drums_2, pop_drums_3];
  let pop_bass = [pop_bass_1, pop_bass_2, pop_bass_3];
  let pop_lead = [pop_lead_1, pop_lead_2, pop_lead_3];
  let pop_vox = [pop_vox_1, pop_vox_2, pop_vox_3];

  let hp_drums = [hp_drums_1, hp_drums_2, hp_drums_3];
  let hp_bass = [hp_bass_1, hp_bass_2, hp_bass_3];
  let hp_lead = [hp_lead_1, hp_lead_2, hp_lead_3];
  let hp_vox = [hp_vox_1, hp_vox_2, hp_vox_3];

  // Rock genre sound arrays
  let rock_drums = [rock_drums_1, rock_drums_2, rock_drums_3];
  let rock_bass = [rock_bass_1, rock_bass_2, rock_bass_3];
  let rock_lead = [rock_lead_1, rock_lead_2, rock_lead_3];
  let rock_vox = [rock_vox_1, rock_vox_2, rock_vox_3];

  // Set volume for Pop genre based on track labels
  if (selectedGenre === "Pop") {
    // Ensure Hiphop and Rock sounds are muted
    setGenreVolumes("Hiphop", 0);
    setGenreVolumes("Rock", 0);

    // Set volumes for Pop genre sounds
    adjustGenreVolume(pop_drums, labels[1]);
    adjustGenreVolume(pop_bass, labels[2]);
    adjustGenreVolume(pop_lead, labels[3]);
    adjustGenreVolume(pop_vox, labels[4]);
  }
  // Set volume for Hiphop genre based on track labels
  else if (selectedGenre === "Hiphop") {
    // Ensure Pop and Rock sounds are muted
    setGenreVolumes("Pop", 0);
    setGenreVolumes("Rock", 0);

    // Set volumes for Hiphop genre sounds
    adjustGenreVolume(hp_drums, labels[1]);
    adjustGenreVolume(hp_bass, labels[2]);
    adjustGenreVolume(hp_lead, labels[3]);
    adjustGenreVolume(hp_vox, labels[4]);
  }
  // Set volume for Rock genre based on track labels
  else if (selectedGenre === "Rock") {
    // Ensure Pop and Hiphop sounds are muted
    setGenreVolumes("Pop", 0);
    setGenreVolumes("Hiphop", 0);

    // Set volumes for Rock genre sounds
    adjustGenreVolume(rock_drums, labels[1]);
    adjustGenreVolume(rock_bass, labels[2]);
    adjustGenreVolume(rock_lead, labels[3]);
    adjustGenreVolume(rock_vox, labels[4]);
  }
  // If no genre is selected, mute all sounds
  else {
    setGenreVolumes("Pop", 0);
    setGenreVolumes("Hiphop", 0);
    setGenreVolumes("Rock", 0);
  }
}

function adjustGenreVolume(samples, label) {
  // Mute all sounds in the genre first
  for (let i = 0; i < samples.length; i++) {
    setVolumeSmooth(samples[i], 0);
  }

  // Then, play the selected sound based on the label
  let selectedSample = selectSample(label, samples);
  if (selectedSample) {
    setVolumeSmooth(selectedSample, 1); // Set volume to 1 for the selected sample
  }
}

function selectSample(label, samples) {
  // Select the appropriate sample based on the label
  switch (label) {
    case "Sample 1":
      return samples[0];
    case "Sample 2":
      return samples[1];
    case "Sample 3":
      return samples[2];
    default:
      return null; // If label is "White" or anything else, return null
  }
}

function setVolumeSmooth(sound, targetVolume) {
  if (sound) {
    let currentVolume = sound.getVolume();
    let newVolume = lerp(currentVolume, targetVolume, fadeSpeed);
    sound.setVolume(newVolume);
  }
}

function setGenreVolumes(genre, volume) {
  let sounds = [];

  if (genre === "Pop") {
    sounds = [
      pop_drums_1, pop_drums_2, pop_drums_3,
      pop_bass_1, pop_bass_2, pop_bass_3,
      pop_lead_1, pop_lead_2, pop_lead_3,
      pop_vox_1, pop_vox_2, pop_vox_3
    ];
  } else if (genre === "Hiphop") {
    sounds = [
      hp_drums_1, hp_drums_2, hp_drums_3,
      hp_bass_1, hp_bass_2, hp_bass_3,
      hp_lead_1, hp_lead_2, hp_lead_3,
      hp_vox_1, hp_vox_2, hp_vox_3
    ];
  } else if (genre === "Rock") {
    sounds = [
      rock_drums_1, rock_drums_2, rock_drums_3,
      rock_bass_1, rock_bass_2, rock_bass_3,
      rock_lead_1, rock_lead_2, rock_lead_3,
      rock_vox_1, rock_vox_2, rock_vox_3
    ];
  }

  for (let i = 0; i < sounds.length; i++) {
    setVolumeSmooth(sounds[i], volume);
  }
}
