import {
    initGameState,
    isEmptyBedSpace,
    isValidTurn,
    isInKittyPool,
    placeKitty,
    isEmptyPool,
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


//Functions from Boop that are actually UI


//Programme set up

document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

Array.from(kitties).forEach(
    (kitty) => kitty.addEventListener("click", function (event) {
        // Prevents bubbling!
        event.stopPropagation();
        if (!heldKitty && isValidTurn(kitty.id, gameState.player)) {
            if (isInKittyPool(gameState, kitty.id)) {
                heldKitty = event.target;
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
            } else if (isEmptyPool(gameState)) {
                let returnKitty = event.target;
                let bedSpace = returnKitty.parentNode;
                gameState = removeKitty(gameState, returnKitty.id, bedSpace.id);
            }
        }
    })
);


Array.from(bedSpaces).forEach(
    (bedSpace) => bedSpace.addEventListener("click", function () {
        if (heldKitty && isEmptyBedSpace(bedSpace.id, gameState.bedState)) {
            let heldKittyID = heldKitty.id;
            heldKitty = dropKitty(heldKitty, bedSpace);
            gameState = placeKitty(bedSpace.id, gameState, heldKittyID);
        }
    })
);

Array.from(kittyPools).forEach(
    (kittyPool) => kittyPool.addEventListener("click", function () {
        if (heldKitty && isValidTurn(kittyPool.id, gameState.player)) {
            heldKitty = dropKitty(heldKitty, kittyPool);
        }
    })
);

//Game Play
let gameState = initGameState();

debugger;