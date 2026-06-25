// Hello! To whoever might be reading this (Freddie?)
// the UI for Boop has both mouse and keyboard accessibility
// using a click and follow style for mouse or tab/space and enter for keyboard.

// Import Functions from Boop
// (ACTIONS): placeKitty, removeKitty, initGameState
// (EXTRACTING INFORMATION): isEmptyBedSpace, isOwnedByPlayer,
// isInKittyPool, isEmptyPool
import {
    initGameState,
    isEmptyBedSpace,
    isOwnedByPlayer,
    isInKittyPool,
    isEmptyPool,
    placeKitty,
    removeKitty
} from "./boop.js";

// Creates HTMLCollections of all kitties, bedSpaces and kittyPools
const kitties = document.getElementsByClassName("kitty");
const bedSpaces = document.getElementsByClassName("cell");
const kittyPools = document.getElementsByClassName("kittyPool");

// Sets that by default no kitty is currently held.
let heldKitty = null;



//Tutorial Code
// Instances HTML objects for tutorial and the close tutorial button.
const tutorialModal = document.getElementById("tutorialModal");
const closeTutorial = document.getElementById("closeTutorial");
tutorialModal.hidden = false;

// Event listener for close tutorial button. Also starts background music.
closeTutorial.addEventListener("click", function () {
    tutorialModal.hidden = true;
    bgm.play();
});



// Restart Button Code
const restartButton = document.getElementById("restartButton");

// Event listener
restartButton.addEventListener("click", function () {
    location.reload();
});



// Sound effect code
// Boop
let boopSound = document.createElement("audio");
boopSound.src = "./assets/boop.mp3";
boopSound.preload = "auto";

// Background Music
let bgm = document.createElement("audio");
bgm.src = "./assets/backgroundmusic.mp3";
bgm.preload = "auto";
bgm.loop = true;
bgm.volume = 0.2;

// Victory
let victory = document.createElement("audio");
victory.src = "./assets/victory.mp3";
victory.preload = "auto";
victory.volume = 0.5;

// Kitten Sounds
const kittenSounds = [
    "./assets/kitten1.wav",
    "./assets/kitten2.wav",
    "./assets/kitten3.wav"
];

// Sound Effect Functions
// Unique instance of boop (for stacking)
function boopAudio() {
    const sound = boopSound.cloneNode();
    sound.play();
}

// Play random kitten sound from library.
function playKittenSound() {
    const randomIndex = Math.floor(Math.random() * kittenSounds.length);
    const sound = document.createElement("audio");
    sound.src = kittenSounds[randomIndex];
    sound.play();
}


// Dragging Code

// Kitty Dragging Variables
let mouseX = 0; // Mouse Location X
let mouseY = 0; // Mouse Location Y
let kittyX = 0; // Kitty Location X
let kittyY = 0; // Kitty location Y
let MAX_Z = 10; // So kittens are above one another visually.
const DRAG_COEFF = 0.25; // Weight of the kitten when dragged.

// Follow the mouse while dragging
function kittyDrag() {
    // Only moves kitty if one is currently held.
    if (heldKitty) {
        // Delay calculation for weight.
        kittyX += (mouseX - kittyX) * DRAG_COEFF;
        kittyY += (mouseY - kittyY) * DRAG_COEFF;
        heldKitty.style.left = (kittyX - heldKitty.offsetWidth / 2) + "px";
        heldKitty.style.top = (kittyY - heldKitty.offsetHeight / 2) + "px";
    }
}



// UI functions

// ARIA Accessibility Function
function pickUpKittyARIA() {
    // Sets all kittens to be not tab selectable.
    Array.from(kitties).forEach(function (kitty) {
        kitty.tabIndex = -1;
    });
    // Sets all bedspaces and current player's pool to be tab selectable.
    Array.from(bedSpaces).forEach(function (bedSpace) {
        bedSpace.tabIndex = 1;
    });
    Array.from(kittyPools).forEach(function (kittyPool) {
        if (kittyPool.id === gameState.currentPlayer) {
            kittyPool.tabIndex = 1;
        }
    });
}

// ARIA Accessibility Function
// Sets valid kitties on player turn.
function kittyPoolARIA() {
    // If the kitty pool is empty sets all current player kittens on the bed.
    if (!isEmptyPool(gameState)) {
        Array.from(kittyPools).forEach(function (kittyPool) {
            Array.from(kittyPool.children).forEach(function (kitty) {
                if (kitty.id.slice(0, -1) === gameState.currentPlayer) {
                    kitty.tabIndex = 0;
                } else {
                    kitty.tabIndex = -1;
                }
            });
        });
    // Else sets all current player kitty pool kitties to tabbable.
    } else {
        Array.from(bedSpaces).forEach(function (bedSpace) {
            Array.from(bedSpace.children).forEach(function (kitty) {
                if (kitty.id.slice(0, -1) === gameState.currentPlayer) {
                    kitty.tabIndex = 0;
                    console.log(kitty);
                } else {
                    kitty.tabIndex = -1;
                }
            });
        });
    }
}

// ARIA Accessibility Function
function dropKittyARIA() {
    // Sets all bedspaces and kitty Pools to not selectable by tab.
    Array.from(bedSpaces).forEach(function (bedSpace) {
        Array.from(bedSpace.children).forEach(function (kitty) {
            kitty.tabIndex = -1;
        });
        bedSpace.tabIndex = -1;
    });
    Array.from(kittyPools).forEach(function (kittyPool) {
        kittyPool.tabIndex = -1;
    });
    // Sets all current player's valid kitties to selectable by tab.
    kittyPoolARIA();
}

// Allows user to click through kitties currently in pool to return kitties.
function setPoolClickThrough(enabled) {
    Array.from(kitties).forEach(
        function (kitty) {
            if (enabled) {
                kitty.style.pointerEvents = "none";
                return;
            }
            kitty.style.pointerEvents = "auto";
        }
    );
}

// Sets UI behaviour for a kitty that is dropped onto the bed or its kitty pool.
function dropKitty(droppedKitty, container) {
    droppedKitty.style.position = "static";
    droppedKitty.style.pointerEvents = "auto";
    droppedKitty.style.zIndex = MAX_Z - 1;
    container.appendChild(droppedKitty);
    document.body.style.cursor = "default";
    document.removeEventListener("mousemove", kittyDrag());
    setPoolClickThrough(false);
    return null;
}

// Sets UI behaviour for a kitty that is pickedUp from its kitty pool.
function pickUpKitty(heldKitty) {
    playKittenSound();
    pickUpKittyARIA();
    heldKitty.style.position = "fixed";
    heldKitty.style.zIndex = MAX_Z + 1;
    heldKitty.style.pointerEvents = "none";
    document.body.style.cursor = "none"; // Remove cursor
    //Prevents elastic banding
    kittyX = mouseX;
    kittyY = mouseY;
    //centre of kitty
    heldKitty.style.left = (
        event.clientX - heldKitty.offsetWidth / 2
    ) + "px";
    heldKitty.style.top = (
        event.clientY - heldKitty.offsetHeight / 2
    ) + "px";
    document.addEventListener("mousemove", kittyDrag);
    setPoolClickThrough(true);
}

// Swaps the colour of the outline for the current player.
function swapPlayer() {
    const bed = document.getElementById("bed");
    bed.classList.remove("orangeFocus", "greyFocus");
    if (gameState.winner) {
        bed.classList.add(gameState.winner + "Focus");
    } else if (gameState.currentPlayer === "orange") {
        bed.classList.add("orangeFocus");
    } else {
        bed.classList.add("greyFocus");
    }
}

// Takes the graduations since last turn and graduates all kitties into cats.
function graduateKittyUI(graduations) {
    graduations.forEach(function (kitty) {
        const kittyElement = document.getElementById(kitty);
        kittyElement.src = "assets/" + kitty.slice(0, -1) + "cat.svg";
    });
}

// Takes the winner, displays the victory screen, pauses background music
// and plays victory sound.
function displayWinner(winner) {
    const winnerPopup = document.getElementById("winner");
    winnerPopup.src = "assets/" + winner + "Wins.svg";
    winnerPopup.alt = "Grey Wins!";
    winnerPopup.classList.add("show-winner-popup");
    bgm.pause();
    victory.play();
}

// Checks if there is a winner and then display's popup if there is.
function isWinner(gameState) {
    if (gameState.winner !== null) {
        displayWinner(gameState.winner);
    }
}

// Smoothly transitions kitty element from current location to new destination.
function transitionKitty(destination, kitty) {
    // Finds starting bounding rectangle
    const start = kitty.getBoundingClientRect();
    // Appends to destination as a child element
    // Finds destinating bounding rectangle
    destination.appendChild(kitty);
    const end = kitty.getBoundingClientRect();
    // Transition in pixels
    const dx = start.left - end.left;
    const dy = start.top - end.top;
    kitty.style.transform = `translate(${dx}px, ${dy}px)`;
    if (kitty.getBoundingClientRect()) {
    // Forces page reflow (only way that JSLint was happy!!)
    }
    // Transition style
    kitty.style.transition = "transform 400ms cubic-bezier(.29,.84,.47,.94)";
    kitty.style.transform = "";
    // Event listener checks for the transition ending and resets style.
    kitty.addEventListener("transitionend", function () {
        kitty.style.transition = "";
    }, {once: true});
}

// Takes boops from game state and extracts kitty and destination for
// transitionKitty. Also plays boop audio.
function boop(boops) {
    boops.forEach(function ([destination, kitty]) {
        const kittyElement = document.getElementById(kitty);
        const destElement = document.getElementById(destination);
        transitionKitty(destElement, kittyElement);
        boopAudio();
    });
}

// UI Behaviour for Kitty Selection
function kittySelection(kitty) {
    if (isInKittyPool(gameState, kitty.id)) {
        event.preventDefault(); // Stop page scrolling
        heldKitty = event.target; // Sets held kitty to target
        pickUpKitty(heldKitty); // Picks up Kitty in UI
    // If there are no kitties in current player's pool
    } else if (isEmptyPool(gameState)) {
        // Remove Kitty (ACTION)
        let returnKitty = event.target;
        let bedSpace = returnKitty.parentNode;
        gameState = removeKitty(gameState, returnKitty.id, bedSpace.id);
        // Graduations, Boops
        graduateKittyUI(gameState.graduations);
        boop(gameState.boops);
        // ARIA accesibility
        dropKittyARIA();
        // Current Player Colour Swap
        swapPlayer();
    }
}

// UI Behaviour for bedSpace selection.
function bedSpaceSelection(bedSpace) {
    event.preventDefault(); // Stops page scrolling
    let heldKittyID = heldKitty.id;
    heldKitty.tabIndex = -1; // Makes held kitty not selectable
    heldKitty = dropKitty(heldKitty, bedSpace); // Drops Kitty
    // Places Kitty (ACTION)
    gameState = placeKitty(bedSpace.id, gameState, heldKittyID);
    // boops and graduations
    boop(gameState.boops);
    graduateKittyUI(gameState.graduations);
    // Checks for winner
    // (A win state can only occur after a place and never a remove)
    isWinner(gameState);
    // Accessibility features.
    dropKittyARIA();
    swapPlayer();
}

// UI behaviour for kitty Pool selection
function kittyPoolSelection(kittyPool) {
    event.preventDefault(); // Stop page scrolling
    // Drops kitty back into pool
    heldKitty = dropKitty(heldKitty, kittyPool);
    // Accessibility features
    dropKittyARIA();
}

// Event Listeners

// Mouse Movement
document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Checks if Tab Accessibility focus is used
document.addEventListener("focusin", function (event) {
    // Instead of mouse following, kitty moves to current selection.
    if (heldKitty) {
        const selected = event.target;
        const rect = selected.getBoundingClientRect();
        kittyX = rect.left + rect.width / 2;
        kittyY = rect.top + rect.height / 2;
        heldKitty.style.left = (kittyX - heldKitty.offsetWidth / 2) + "px";
        heldKitty.style.top = (kittyY - heldKitty.offsetHeight / 2) + "px";
    }
});

// Kitty selection events.
Array.from(kitties).forEach(function (kitty) {
    kitty.addEventListener("click", function (event) {
        // Prevents bubbling!!!
        // Therefore kitty doesn't go immediately back into pool.
        event.stopPropagation();
        if (
            !heldKitty &&
            isOwnedByPlayer(kitty.id, gameState.currentPlayer) &&
            !gameState.winner
        ) {
            kittySelection(kitty);
        }
    });
    kitty.addEventListener("keydown", function (event) {
        event.stopPropagation();
        if (
            (event.key === "Enter" || event.key === " ") &&
            !heldKitty &&
            isOwnedByPlayer(kitty.id, gameState.currentPlayer) &&
            !gameState.winner
        ) {
            kittySelection(kitty);
        }
    });
});


// Bedspace selection events.
Array.from(bedSpaces).forEach(function (bedSpace) {
    bedSpace.addEventListener("click", function () {
        if (
            heldKitty &&
            isEmptyBedSpace(bedSpace.id, gameState.bedState) &&
            !gameState.winner
        ) {
            bedSpaceSelection(bedSpace);
        }
    });
    bedSpace.addEventListener("keydown", function (event) {
        if (
            (event.key === "Enter" || event.key === " ") &&
            heldKitty &&
            isEmptyBedSpace(bedSpace.id, gameState.bedState) &&
            !gameState.winner
        ) {
            bedSpaceSelection(bedSpace);
        }
    });
});

// Kitty pool selection events.
Array.from(kittyPools).forEach(function (kittyPool) {
    kittyPool.addEventListener("click", function () {
        if (
            heldKitty &&
            isOwnedByPlayer(kittyPool.id, gameState.currentPlayer) &&
            !gameState.winner
        ) {
            kittyPoolSelection(kittyPool);
        }
    });
    kittyPool.addEventListener("keydown", function (event) {
        if (
            (event.key === "Enter" || event.key === " ") &&
            heldKitty &&
            isOwnedByPlayer(kittyPool.id, gameState.currentPlayer) &&
            !gameState.winner
        ) {
            kittyPoolSelection(kittyPool);
        }
    });
});

//Game Play
let gameState = initGameState();

debugger;