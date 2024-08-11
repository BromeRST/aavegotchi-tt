// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AppStorage, Modifiers} from "../libraries/AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "hardhat/console.sol";

contract GameFacet3 is Modifiers {
    /// @dev Captures a tile if the played Gotchi's traits are favorable compared to the adjacent Gotchi.
    ///      This function is called for each adjacent tile of the played card to evaluate if it can be captured.
    /// @param matchId The ID of the current match.
    /// @param x The x-coordinate of the tile to potentially capture.
    /// @param y The y-coordinate of the tile to potentially capture.
    /// @param playerGotchiParams The traits of the played Gotchi used for comparison in capturing.
    function captureTile(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        // Check if the tile is active and owned by the opponent
        if (
            s.grids[matchId][y][x].isActive &&
            s.grids[matchId][y][x].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y][x].tokenId;
            int16[6] memory oppositeGotchiParams = IAavegotchiDiamond(
                s.aavegotchiDiamond
            ).getAavegotchi(oppositeTokenId).modifiedNumericTraits;

            int16 playerLeftTrait = playerGotchiParams[3]; // Player's left trait
            int16 opponentRightTrait = oppositeGotchiParams[1]; // Opponent's right trait

            int16 playerRightTrait = playerGotchiParams[1]; // Player's right trait
            int16 opponentLeftTrait = oppositeGotchiParams[3]; // Opponent's left trait

            int16 playerUpTrait = playerGotchiParams[0]; // Player's up trait
            int16 opponentDownTrait = oppositeGotchiParams[2]; // Opponent's down trait

            int16 playerDownTrait = playerGotchiParams[2]; // Player's down trait
            int16 opponentUpTrait = oppositeGotchiParams[0]; // Opponent's up trait

            // Capture logic based on trait comparison

            // Capture left tile if current x > 0 and player's left trait > opponent's right trait
            if (x > 0 && playerLeftTrait > opponentRightTrait) {
                s.grids[matchId][y][x - 1].winner = msg.sender;
            }

            // Capture right tile if current x < 2 and player's right trait > opponent's left trait
            if (x < 2 && playerRightTrait > opponentLeftTrait) {
                s.grids[matchId][y][x + 1].winner = msg.sender;
            }

            // Capture tile above if current y > 0 and player's up trait > opponent's down trait
            if (y > 0 && playerUpTrait > opponentDownTrait) {
                s.grids[matchId][y - 1][x].winner = msg.sender;
            }

            // Capture tile below if current y < 2 and player's down trait > opponent's up trait
            if (y < 2 && playerDownTrait > opponentUpTrait) {
                s.grids[matchId][y + 1][x].winner = msg.sender;
            }
        }
    }

    function popArray(uint256[] storage _array, uint256 _index) internal {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    function traitToValue(uint256 num) public pure returns (uint256) {
        if (num <= 1 || num >= 99) return 10; // A
        if ((num >= 2 && num <= 3) || (num >= 97 && num <= 98)) return 9;
        if ((num >= 4 && num <= 5) || (num >= 95 && num <= 96)) return 8;
        if ((num >= 6 && num <= 7) || (num >= 93 && num <= 94)) return 7;
        if ((num >= 8 && num <= 9) || (num >= 91 && num <= 92)) return 6;
        if ((num >= 10 && num <= 19) || (num >= 81 && num <= 90)) return 5;
        if ((num >= 20 && num <= 29) || (num >= 71 && num <= 80)) return 4;
        if ((num >= 30 && num <= 39) || (num >= 61 && num <= 70)) return 3;
        if ((num >= 40 && num <= 49) || (num >= 51 && num <= 60)) return 2;
        if (num == 50) return 1; // J
        return 0; // None
    }
}
