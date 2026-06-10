// Declarations
import R from "./ramda.js";
/**
 * Creates a new game state.
 * @returns {object} - A game state initialised with default values.
 */
function initGameState() {
    return {
        "bedState": [
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ],
        "player": "orange",
        "winner": null,
        "kittyPool": {
            "orange": [
                {"id": "orange1", "isCat": false},
                {"id": "orange2", "isCat": false},
                {"id": "orange3", "isCat": false},
                {"id": "orange4", "isCat": false},
                {"id": "orange5", "isCat": false},
                {"id": "orange6", "isCat": false},
                {"id": "orange7", "isCat": false},
                {"id": "orange8", "isCat": false}
            ],
            "grey": [
                {"id": "grey1", "isCat": false},
                {"id": "grey2", "isCat": false},
                {"id": "grey3", "isCat": false},
                {"id": "grey4", "isCat": false},
                {"id": "grey5", "isCat": false},
                {"id": "grey6", "isCat": false},
                {"id": "grey7", "isCat": false},
                {"id": "grey8", "isCat": false}
            ]
        }
    };
}

/**
 * Returns current player's kitty pool.
 * @param {object} gameState - The current game state.
 * @returns {object} The current player's kitty pool.
 */
function getKittyPool(gameState) {
    return gameState.kittyPool[gameState.player];
}

/**
 * Converts a string element ID to a set of grid coordinates.
 * @param {string} id - The element's id
 * @returns {number[]} - The row and column coordinates of the element.
 */
function getCoordinatesFromID(id) {
    return [Number(id[0]), Number(id[1])]; //row and column
}

/**
 * Converts an set of grid coordinates into an element ID string.
 * @param {number} row - The element's row.
 * @param {number} column - The element's column.
 * @returns {string} - The element ID of the cell at those coordinates.
 */
function getIDFromCoords(row, column) {
    return String(row) + String(column);
}

function isEmptyBedSpace(bedSpaceID, bedState) {
    const [row, column] = getCoordinatesFromID(bedSpaceID);
    if (bedState[row][column] === null) {
        return true;
    }
    return false;
}

function isValidTurn(elementID, player) {
    if (elementID[0] === player[0]) {
        return true;
    }
    return false;
}

function isInKittyPool(gameState, kittyID) {
    const player = gameState.player;
    const pool = gameState.kittyPool[player].map((kitty) => kitty.id);
    return (pool.includes(kittyID));
}

function swapPlayer(player) {
    if (player === "orange") {
        return "grey";
    }
    return "orange";
}

function updateBedAndPools(bedSpaceID, gameState, placedKitty) {
    const [row, column] = getCoordinatesFromID(bedSpaceID);
    gameState.bedState[row][column] = getKittyPool(gameState).filter(
        (kitty) => kitty.id === placedKitty
    )[0];
    gameState.kittyPool[gameState.player] = getKittyPool(gameState).filter(
        (kitty) => kitty.id !== placedKitty
    );
    return gameState;
}


// Boop Mechanics

//Works
function getAdjacentKitties(bedState, bedSpaceID) {
    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];
    const results = [];
    const [row, column] = getCoordinatesFromID(bedSpaceID);
    directions.forEach(function ([dr, dc]) {
        const checkRow = row + dr;
        const checkColumn = column + dc;

        if (
            checkRow >= 0 &&
            checkRow < bedState.length &&
            checkColumn >= 0 &&
            checkColumn < bedState[0].length
        ) {
            const value = bedState[checkRow][checkColumn];
            if (value !== null) {
                results.push({row: checkRow, column: checkColumn, value});
            }
        }
    });
    return results;
}

//Works
function getBoopSpace([boopRow, boopColumn], [boopedRow, boopedColumn]) {
    return [
        boopedRow + (boopedRow - boopRow),
        boopedColumn + (boopedColumn - boopColumn)
    ];
}

//Works
function isOffBoard(row, column) {
    if (row < 0 || column < 0 || row > 5 || column > 5) {
        return true;
    }
    return false;
}

//Works
function checkBoopSpace(
    bedState,
    [boopRow, boopColumn], // coordinates of placed kitty
    [boopedRow, boopedColumn] // starting coordinates of booped kitty
) {
    const [rowDest, colDest] = getBoopSpace(
        [boopRow, boopColumn],
        [boopedRow, boopedColumn]
    );
    if (isOffBoard(rowDest, colDest)) {
        return "offboard";
    }
    if (bedState[rowDest][colDest] === null) {
        return [rowDest, colDest];
    }
    return false;
}

//Works!!
function checkCatKitten(boopingKitty, boopedKitty) {
    if (boopedKitty.isCat && !boopingKitty.isCat) {
        return false;
    }
    return true;
}

//Works!!
function checkBoopable(bedState, bedSpaceID) {
    let boopable = getAdjacentKitties(bedState, bedSpaceID);
    console.log(boopable);
    const [row, column] = getCoordinatesFromID(bedSpaceID);
    boopable = boopable.filter(function (kitty) {
        return (checkCatKitten(bedState[row][column], kitty.value));
    });
    boopable = boopable.map(
        (kitty) =>
        [
            kitty,
            checkBoopSpace(
                bedState,
                [row, column],
                [kitty.row, kitty.column]
            )
        ]
    );
    boopable = boopable.filter((kitty) => kitty[1] !== false);
    return boopable;
}


function updateBedWithBoops(boopables, gameState) {
    boopables.forEach(function (kitty) {
        const [row, col] = [kitty[0].row, kitty[0].column];
        const player = kitty[0].value.id.slice(0, -1);
        if (kitty[1] !== "offboard") {
            const [rowDest, colDest] = kitty[1];
            gameState.bedState[rowDest][colDest] = gameState.bedState[row][col];
        } else {
            gameState.kittyPool[player].push(kitty[0].value);
        }
        gameState.bedState[row][col] = null;
    });
    return gameState;
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

//Detect 3 in a row
function findRowsOfThree(bedState) {
    const trios = [];

    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal down-right
        [1, -1]  // diagonal down-left
    ];
    R.range(0, 6).forEach(function (row) {
        R.range(0, 6).forEach(function (column) {
            const cell = bedState[row][column];
            //skips if it's an empty cell
            if (!cell) {
                return;
            }

            const player = cell.id.slice(0, -1);

            directions.forEach(function ([dirRow, dirCol]) {
                let kittiesInRow = [{
                    "row": row,
                    "column": column,
                    "value": bedState[row][column]
                }];

                R.range(1, 3).some(function (step) {
                    const nextRow = row + dirRow * step;
                    const nextCol = column + dirCol * step;
                    if (
                        isOffBoard(nextRow, nextCol) ||
                        !bedState[nextRow][nextCol] ||
                        bedState[nextRow][nextCol].id.slice(0, -1) !== player
                    ) {
                        return true;
                    }
                    kittiesInRow.push({
                        "row": nextRow,
                        "column": nextCol,
                        "value": bedState[nextRow][nextCol]
                    }); //then it is in a row
                });
                if (kittiesInRow.length === 3) {
                    trios.push(kittiesInRow);
                }
            });
        });
    });
    return trios;
}


function isEmptyPool(gameState) {
    if (gameState.kittyPool[gameState.player].length < 1) {
        return true;
    }
    return false;
}

// Needs spliting into UI and non UI function
function graduateKitty(kitty) {
    const kittyElement = document.getElementById(kitty.id);
    kittyElement.src = "assets/" + kitty.id.slice(0, -1) + "cat.svg";
    kitty.isCat = true;
    return kitty;
}

// UI Function
function displayWinner(winner) {
    const winnerPopup = document.getElementById("winner");
    winnerPopup.src = "assets/" + winner + "Wins.svg";
    winnerPopup.classList.add("show-winner-popup");
}

/**
 * Counts the number of cats of each colour on the bed.
 * @param {object[][]} bedState - The values in each row and column of the bed.
 * @returns {[number,number]} - The number of orange and grey cats respectively.
 */
function countCats(bedState) {
    let orangeCats = 0;
    let greyCats = 0;
    bedState = bedState.flat();
    bedState = bedState.filter((kitty) => kitty !== null);
    bedState = bedState.filter((kitty) => kitty.isCat);
    bedState.forEach(function (kitty) {
        if (kitty.id.slice(0, -1) === "orange") {
            orangeCats += 1;
        } else {
            greyCats += 1;
        }
    });
    return [orangeCats, greyCats];
}

/**
 * Checks if the current game state results in a winner.
 * @param {object} gameState - The current game state.
 * @returns {string} The winning player or null if there isn't one.
 */
function getWinner(gameState) {
    if (!gameState.winner) {
        const trios = findRowsOfThree(gameState.bedState);
        trios.forEach(function (trio) {
            if (trio.every((kitty) => kitty.value.isCat)) {
                gameState.winner = trio[0].value.id.slice(0, -1);
            }
        });
        let [orangeCats, greyCats] = countCats(gameState.bedState);
        if (orangeCats === 8) {
            gameState.winner = "orange";
        } else if (greyCats === 8) {
            gameState.winner = "grey";
        }
    }
    return gameState.winner;
}

function removeRowOfThree(gameState, trios) {
    trios.forEach(function (trio) {
        console.log(trio.every((kitty) => kitty.isCat));
        if (!trio.every((kitty) => kitty.value.isCat)) {
            trio.forEach(function (kitty) {
                const [row, column] = [kitty.row, kitty.column];
                const player = kitty.value.id.slice(0, -1);
                kitty.value = graduateKitty(kitty.value);
                gameState.kittyPool[player].push(kitty.value);
                gameState.bedState[row][column] = null;
                const kittyPool = document.getElementById(player);
                const aKitty = document.getElementById(kitty.value.id);
                transitionKitty(kittyPool, aKitty);
            });
        }
    });
    return gameState;
}

function removeKitty(gameState, kittyID, bedSpaceID) {
    const player = kittyID.slice(0, -1);
    const [row, column] = getCoordinatesFromID(bedSpaceID);
    let kitty = gameState.bedState[row][column];
    kitty = graduateKitty(kitty);
    gameState.kittyPool[player].push(kitty);
    gameState.bedState[row][column] = null;
    gameState.player = swapPlayer(gameState.player);
    const kittyPool = document.getElementById(player);
    const aKitty = document.getElementById(kittyID);
    transitionKitty(kittyPool, aKitty);
    return gameState;
}

function boop(gameState, boopables) {
    boopables.forEach(function (kitty) {
        const aKitty = document.getElementById(kitty[0].value.id);
        const player = kitty[0].value.id.slice(0, -1);
        if (kitty[1] !== "offboard") {
            const [rowDest, colDest] = kitty[1];
            const cell = document.getElementById(getIDFromCoords(
                rowDest,
                colDest
            ));
            transitionKitty(cell, aKitty);
        } else {
            const kittyPool = document.getElementById(player);
            transitionKitty(kittyPool, aKitty);
        }
    });
    return updateBedWithBoops(boopables, gameState);
}

function placeKitty(bedSpaceID, gameState, placedKitty) {
    if (isEmptyBedSpace(bedSpaceID, gameState.bedState)) {
        gameState = updateBedAndPools(bedSpaceID, gameState, placedKitty);
        gameState.player = swapPlayer(gameState.player);
        gameState = boop(gameState, checkBoopable(
            gameState.bedState,
            bedSpaceID
        ));
    }
    const trios = (findRowsOfThree(gameState.bedState));
    gameState = removeRowOfThree(gameState, trios);
    gameState.winner = getWinner(gameState);
    //remove this to UI section
    if (gameState.winner) {
        displayWinner(gameState.winner);
    }
    console.log(gameState);
    return gameState;
}

//Exports
export {
    initGameState,
    isEmptyBedSpace,
    isValidTurn,
    isInKittyPool,
    placeKitty,
    isEmptyPool,
    removeKitty
};

debugger;