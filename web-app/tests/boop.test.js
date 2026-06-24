import assert from "assert";
import Boop from "../boop.js";

const initGameState = Boop.initGameState;
describe("initGameState", function () {

    it("creates a game state with default values", function () {
        const gameState = initGameState();
        assert.strictEqual(gameState.currentPlayer, "orange");
        assert.strictEqual(gameState.winner, null);
        assert.strictEqual(gameState.bedState.length, 6);
        assert.strictEqual(gameState.bedState[0].length, 6);
        assert.ok(
            gameState.bedState.flat().every(
                (space) => space === null
            )
        );
        assert.strictEqual(gameState.kittyPool.orange.length, 8);
        assert.strictEqual(gameState.kittyPool.grey.length, 8);
        assert.deepStrictEqual(gameState.boops, []);
        assert.deepStrictEqual(gameState.graduations, []);
    });


    it("creates independent game states", function () {
        const state1 = initGameState();
        const state2 = initGameState();
        state1.boops.push(["orange", "orange1"]);
        assert.deepStrictEqual(state2.boops, []);
    });
});

const getKittyPool = Boop.getKittyPool;
describe("getKittyPool", function () {
    it("returns orange's pool when orange is the current player", function () {
        const gameState = initGameState();
        const pool = getKittyPool(gameState);
        const expected = gameState.kittyPool.orange;
        if (pool !== expected) {
            throw new Error("Expected orange's kitty pool");
        }
    });
    it("returns grey's pool when grey is the current player", function () {
        const gameState = initGameState();
        gameState.currentPlayer = "grey";
        const pool = getKittyPool(gameState);
        const expected = gameState.kittyPool.grey;
        if (pool !== expected) {
            throw new Error("Expected grey's kitty pool");
        }
    });

});

const getCoordinatesFromID = Boop.getCoordinatesFromID;
describe("getCoordinatesFromID", function () {
    it("converts an ID to coordinates", function () {
        const coords = getCoordinatesFromID("00");
        const expected = [0, 0];
        assert.deepStrictEqual(coords, expected);
    });
});

const getIDFromCoords = Boop.getIDFromCoords;
describe("getIDFromCoords", function () {
    it("converts coordinates to an ID", function () {
        const ID = getIDFromCoords(0, 0);
        const expected = "00";
        assert.strictEqual(ID, expected);
    });
});

const isEmptyBedSpace = Boop.isEmptyBedSpace;
describe("isEmptyBedSpace", function () {
    it("returns true if bed space is empty", function () {
        const gameState = initGameState();
        const bedState = gameState.bedState;
        const isEmpty = isEmptyBedSpace("00", bedState);
        if (isEmpty !== true) {
            throw new Error("Expected empty bed space.");
        }
    });
    it("returns false if bed space is occupied", function () {
        const gameState = initGameState();
        const bedState = gameState.bedState;
        bedState[0][0] = {"id": "orange1", "isCat": false};
        const isEmpty = isEmptyBedSpace("00", bedState);
        if (isEmpty !== false) {
            throw new Error("Expected occupied bed space.");
        }
    });
});


const placeKitty = Boop.placeKitty;

describe("placeKitty", function () {
    it("places a kitty on an empty bed space", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        const expected = {"id": "orange1", "isCat": false};
        assert.deepStrictEqual(
            gameState.bedState[0][0],
            expected
        );
    });
    it("removes the placed kitty from the player's pool", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        const pool = gameState.kittyPool.orange;
        assert.strictEqual(pool.length, 7);
        assert.strictEqual(
            pool.some((kitty) => kitty.id === "orange1"),
            false
        );
    });
    it("changes the current player after placing a kitty", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        assert.strictEqual(
            gameState.currentPlayer,
            "grey"
        );
    });
    it("does not place a kitty on an occupied space", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        gameState = placeKitty("00", gameState, "grey1");
        const expected = {"id": "orange1", "isCat": false};
        assert.deepStrictEqual(
            gameState.bedState[0][0],
            expected
        );
        assert.strictEqual(
            gameState.kittyPool.grey.length,
            8
        );
    });
    it("boops an adjacent kitty when placing a kitty", function () {
        let gameState = initGameState();
        // Orange places next to grey
        gameState = placeKitty("00", gameState, "orange1");
        gameState = placeKitty("01", gameState, "grey1");
        const expected = {"id": "grey1", "isCat": false};
        // Grey is Placed
        assert.deepStrictEqual(
            gameState.bedState[0][1],
            expected
        );
        // Orange is Gone
        assert.deepStrictEqual(
            gameState.bedState[0][0],
            null
        );
        //boop is registered
        assert.deepStrictEqual(
            gameState.boops,
            [["orange", "orange1"]]
        );
        assert.strictEqual(
            gameState.kittyPool.orange.some((kitty) => kitty.id === "orange1"),
            true
        );
    });
    it("removes three kitties in a row and graduates them", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        gameState = placeKitty("55", gameState, "grey1");
        gameState = placeKitty("20", gameState, "orange2");
        gameState = placeKitty("30", gameState, "grey2");
        // This creates orange1, orange2, orange3 in a row
        gameState = placeKitty("20", gameState, "orange3");
        assert.strictEqual(
            gameState.bedState[0][0],
            null
        );
        assert.strictEqual(
            gameState.bedState[1][0],
            null
        );
        assert.strictEqual(
            gameState.bedState[2][0],
            null
        );
        assert.deepStrictEqual(
            gameState.graduations,
            ["orange1", "orange2", "orange3"]
        );
        assert.strictEqual(
            gameState.kittyPool.orange.length,
            8
        );
    });
    it("boops all immediately adjacent or diagonal kitties", function () {
        let gameState = initGameState();
        gameState.bedState = [
            [null, null, null, null, null, null],
            [
                null,
                {"id": "grey1", "isCat": false},
                {"id": "orange1", "isCat": false},
                {"id": "grey2", "isCat": false},
                null,
                null
            ],
            [
                null,
                {"id": "orange2", "isCat": false},
                null,
                {"id": "orange3", "isCat": false},
                null,
                null
            ],
            [
                null,
                {"id": "grey3", "isCat": false},
                {"id": "orange4", "isCat": false},
                {"id": "grey4", "isCat": false},
                null,
                null
            ],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ];
        gameState = placeKitty("22", gameState, "orange5");
        const expected = [
            [
                {"id": "grey1", "isCat": false},
                null,
                {"id": "orange1", "isCat": false},
                null,
                {"id": "grey2", "isCat": false},
                null
            ],
            [null, null, null, null, null, null],
            [
                {"id": "orange2", "isCat": false},
                null,
                {"id": "orange5", "isCat": false},
                null,
                {"id": "orange3", "isCat": false},
                null
            ],
            [null, null, null, null, null, null],
            [
                {"id": "grey3", "isCat": false},
                null, {"id": "orange4", "isCat": false},
                null,
                {"id": "grey4", "isCat": false},
                null
            ],
            [null, null, null, null, null, null]
        ];
        assert.deepStrictEqual(gameState.bedState, expected);
    });
    it("clears previous boops before a new turn", function () {
        let gameState = initGameState();
        gameState.boops = [["00", "orange1"]];
        gameState.graduations = ["orange1"];
        gameState = placeKitty("00", gameState, "orange1");
        assert.deepStrictEqual(
            gameState.boops,
            []
        );
        assert.deepStrictEqual(
            gameState.graduations,
            []
        );
    });
    it("does not allow the wrong player to place a kitty", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "grey1");
        assert.strictEqual(
            gameState.bedState[0][0],
            null
        );
        assert.strictEqual(
            gameState.kittyPool.grey.length,
            8
        );
    });
    it("sets winner when a player gets three cats in a row", function () {
        let gameState = initGameState();
        gameState.bedState = [
            [
                {"id": "orange1", "isCat": true},
                {"id": "orange2", "isCat": true},
                {"id": "orange3", "isCat": true},
                null,
                null,
                null
            ],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
        ];
        gameState = placeKitty("55", gameState, "orange4");
        assert.strictEqual(
            gameState.winner,
            "orange"
        );
    });
    it("returns a booped kitty to the pool when pushed off the board", function () {
        let gameState = initGameState();
        gameState = placeKitty("00", gameState, "orange1");
        gameState = placeKitty("01", gameState, "grey1");
        assert.strictEqual(
            gameState.bedState[0][0],
            null
        );
        assert.strictEqual(
            gameState.kittyPool.orange.length,
            8
        );
    });
});