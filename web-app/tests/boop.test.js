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