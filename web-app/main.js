import {
    initGameState,
    isEmptyBedSpace,
    isValidTurn,
    isInKittyPool,
    isEmptyPool,
    placeKitty,
    removeKitty
} from "./boop.js";

const kitties = document.getElementsByClassName("kitty");
const bedSpaces = document.getElementsByClassName("cell");
const kittyPools = document.getElementsByClassName("kittyPool");

let heldKitty = null;

// Dragging Lagging
let mouseX = 0; //Mouse Location X
let mouseY = 0; //Mouse Location Y
let kittyX = 0; //Kitty Location X
let kittyY = 0; //Kitty location Y
let MAX_Z = 10; //So kittens are above one another
const DRAG_COEFF = 0.25;

// Follow the mouse while dragging
function kittyDrag() {
    if (heldKitty) {
        kittyX += (mouseX - kittyX) * DRAG_COEFF;
        kittyY += (mouseY - kittyY) * DRAG_COEFF;
        heldKitty.style.left = (kittyX - heldKitty.offsetWidth / 2) + "px";
        heldKitty.style.top = (kittyY - heldKitty.offsetHeight / 2) + "px";
    }
}

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

function pickUpKitty(heldKitty) {
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

//Functions from Boop that are actually UI

function graduateKittyUI(graduations) {
    graduations.forEach(function (kitty) {
        const kittyElement = document.getElementById(kitty);
        kittyElement.src = "assets/" + kitty.slice(0, -1) + "cat.svg";
    });
}

function displayWinner(winner) {
    const winnerPopup = document.getElementById("winner");
    winnerPopup.src = "assets/" + winner + "Wins.svg";
    winnerPopup.alt = "Grey Wins!";
    winnerPopup.classList.add("show-winner-popup");
}

function isWinner(gameState) {
    if (gameState.winner !== null) {
        displayWinner(gameState.winner);
    }
}

function transitionKitty(destination, kitty) {
    const start = kitty.getBoundingClientRect();
    destination.appendChild(kitty);
    const end = kitty.getBoundingClientRect();
    //transition in pixels
    const dx = start.left - end.left;
    const dy = start.top - end.top;
    kitty.style.transform = `translate(${dx}px, ${dy}px)`;
    if (kitty.getBoundingClientRect()) {
    // force reflow
    }
    //
    kitty.style.transition = "transform 400ms cubic-bezier(.29,.84,.47,.94)";
    kitty.style.transform = "";

    kitty.addEventListener("transitionend", function () {
        kitty.style.transition = "";
    }, {once: true});
}

function kittyPoolARIA() {
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

function boop(boops) {
    boops.forEach(function ([destination, kitty]) {
        const kittyElement = document.getElementById(kitty);
        const destElement = document.getElementById(destination);
        transitionKitty(destElement, kittyElement);
    });
}

function pickUpKittyARIA() {
    Array.from(kitties).forEach(function (kitty) {
        kitty.tabIndex = -1;
    });
    let index = 1;
    Array.from(bedSpaces).forEach(function (bedSpace) {
        bedSpace.tabIndex = index + 1;
    });
    Array.from(kittyPools).forEach(function (kittyPool) {
        if (kittyPool.id === gameState.currentPlayer) {
            kittyPool.tabIndex = 1;
        }
    });
}

function dropKittyARIA() {
    Array.from(bedSpaces).forEach(function (bedSpace) {
        Array.from(bedSpace.children).forEach(function (kitty){
            kitty.tabIndex = -1;
        });
        bedSpace.tabIndex = -1;
    });
    Array.from(kittyPools).forEach(function (kittyPool) {
        kittyPool.tabIndex = -1;
    });
    kittyPoolARIA();
}

//Programme set up

document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

Array.from(kitties).forEach(function (kitty) {
    kitty.addEventListener("click", function (event) {
        // Prevents bubbling!
        event.stopPropagation();
        if (!heldKitty && isValidTurn(kitty.id, gameState.currentPlayer)) {
            if (isInKittyPool(gameState, kitty.id)) {
                heldKitty = event.target;
                pickUpKitty(heldKitty);
            } else if (isEmptyPool(gameState)) {
                let returnKitty = event.target;
                let bedSpace = returnKitty.parentNode;
                gameState = removeKitty(gameState, returnKitty.id, bedSpace.id);
                graduateKittyUI(gameState.graduations); 
                boop(gameState.boops);
                dropKittyARIA();
            }
        }
    });
    kitty.addEventListener("keydown", function (event) {
        event.stopPropagation();
        if (
            (event.key === "Enter" || event.key === " ") &&
            !heldKitty &&
            isValidTurn(kitty.id, gameState.currentPlayer)
        ) {
            if (isInKittyPool(gameState, kitty.id)) {
                event.preventDefault(); //stop page scrolling
                heldKitty = event.target;
                pickUpKitty(heldKitty);
            } else if (isEmptyPool(gameState)) {
                let returnKitty = event.target;
                let bedSpace = returnKitty.parentNode;
                gameState = removeKitty(gameState, returnKitty.id, bedSpace.id);
                graduateKittyUI(gameState.graduations);
                boop(gameState.boops);
                dropKittyARIA();
            }
        }
    });
});

Array.from(bedSpaces).forEach(function (bedSpace) {
    bedSpace.addEventListener("click", function () {
        if (heldKitty && isEmptyBedSpace(bedSpace.id, gameState.bedState)) {
            let heldKittyID = heldKitty.id;
            heldKitty.tabIndex = -1;
            heldKitty = dropKitty(heldKitty, bedSpace);
            gameState = placeKitty(bedSpace.id, gameState, heldKittyID);
            boop(gameState.boops);
            graduateKittyUI(gameState.graduations);
            isWinner(gameState);
            dropKittyARIA();
        }
    });
    bedSpace.addEventListener("keydown", function (event) {
        if (
            (event.key === "Enter" || event.key === " ") &&
            heldKitty &&
            isEmptyBedSpace(bedSpace.id, gameState.bedState)
        ) {
            event.preventDefault(); //stop page scrolling
            let heldKittyID = heldKitty.id;
            heldKitty.tabIndex = -1;
            heldKitty = dropKitty(heldKitty, bedSpace);
            gameState = placeKitty(bedSpace.id, gameState, heldKittyID);
            boop(gameState.boops);
            graduateKittyUI(gameState.graduations);
            isWinner(gameState);
            dropKittyARIA();
        }
    });
});

Array.from(kittyPools).forEach(function (kittyPool) {
    kittyPool.addEventListener("click", function () {
        if (heldKitty && isValidTurn(kittyPool.id, gameState.currentPlayer)) {
            heldKitty = dropKitty(heldKitty, kittyPool);
            dropKittyARIA();
        }
    });
    kittyPool.addEventListener("keydown", function (event) {
        if (
            (event.key === "Enter" || event.key === " ") &&
            heldKitty &&
            isValidTurn(kittyPool.id, gameState.currentPlayer)
        ) {
            event.preventDefault(); //stop page scrolling
            heldKitty = dropKitty(heldKitty, kittyPool);
            dropKittyARIA();
        }
    });
});

//Game Play
let gameState = initGameState();

debugger;