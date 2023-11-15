// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile} from "../libraries/AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "hardhat/console.sol";

contract GameFacet2 is Modifiers {
    /// @notice Emitted when a card is played in a match.
    /// @param _matchId The ID of the match where the card is played.
    event CardPlayed(uint256 indexed _matchId);

    /// @notice Allows a player to play a card.
    /// @param tokenId The ID of the card being played.
    /// @param matchId The ID of the match.
    /// @param x The x-coordinate on the game grid where the card is played.
    /// @param y The y-coordinate on the game grid where the card is played.
    function playCard(
        uint256 tokenId,
        uint256 matchId,
        uint256 x,
        uint256 y
    ) external {
        validatePlayConditions(matchId, tokenId, x, y);
        updateGameGrid(matchId, tokenId, x, y);
        emit CardPlayed(matchId);

        if (s.matches[matchId].movsCounter == 9) {
            checkWinner(matchId);
        }
    }

    /// @dev Validates the conditions to play a card in a match.
    /// @param matchId The ID of the match.
    /// @param tokenId The ID of the token (card) being played.
    /// @param x The x-coordinate on the game grid.
    /// @param y The y-coordinate on the game grid.
    function validatePlayConditions(
        uint256 matchId,
        uint256 tokenId,
        uint256 x,
        uint256 y
    ) internal {
        require(x < 3 && y < 3, "GameFacet: Invalid coordinates");
        require(
            !s.grids[matchId][y][x].isActive,
            "GameFacet: Spot already taken"
        );

        bool isPlayerTurn = s.matches[matchId].player2Turn
            ? msg.sender == s.matches[matchId].player2
            : msg.sender == s.matches[matchId].player1;
        require(isPlayerTurn, "GameFacet: Not your turn");

        // Check if the token belongs to the player
        bool isTokenValid = false;
        uint256[] storage playerTokens = s.matches[matchId].player2Turn
            ? s.matches[matchId].player2Gotchis
            : s.matches[matchId].player1Gotchis;
        for (uint256 i = 0; i < playerTokens.length; i++) {
            if (tokenId == playerTokens[i]) {
                isTokenValid = true;
                popArray(playerTokens, i);
                break;
            }
        }
        require(isTokenValid, "GameFacet: Invalid token");
    }

    /// @dev Updates the game grid after a card is played.
    ///      This involves setting the played card on the grid, updating game state,
    ///      and potentially capturing adjacent tiles.
    /// @param matchId The ID of the current match.
    /// @param tokenId The ID of the card being played.
    /// @param x The x-coordinate on the game grid where the card is played.
    /// @param y The y-coordinate on the game grid where the card is played.
    function updateGameGrid(
        uint256 matchId,
        uint256 tokenId,
        uint256 x,
        uint256 y
    ) internal {
        // Set the current tile as active with the played token
        s.grids[matchId][y][x].isActive = true;
        s.grids[matchId][y][x].tokenId = tokenId;
        s.grids[matchId][y][x].winner = msg.sender;
        s.matches[matchId].movsCounter++;

        // Get the traits of the played Gotchi
        int16[6] memory playerGotchiParams = IAavegotchiDiamond(
            s.aavegotchiDiamond
        ).getAavegotchi(tokenId).modifiedNumericTraits;

        // Check adjacent tiles and potentially capture them
        checkAndCaptureAdjacent(matchId, x, y, playerGotchiParams);

        // Switch the turn to the other player
        s.matches[matchId].player2Turn = !s.matches[matchId].player2Turn;
    }

    /// @dev Checks and captures adjacent tiles based on the traits of the played Gotchi.
    ///      This function is called after a card is played to evaluate if adjacent cards can be captured.
    /// @param matchId The ID of the current match.
    /// @param x The x-coordinate of the played card on the game grid.
    /// @param y The y-coordinate of the played card on the game grid.
    function checkAndCaptureAdjacent(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        // Check each direction: left, right, up, down
        if (x > 0) {
            captureTile(matchId, x - 1, y, playerGotchiParams);
        }
        if (x < 2) {
            captureTile(matchId, x + 1, y, playerGotchiParams);
        }
        if (y > 0) {
            captureTile(matchId, x, y - 1, playerGotchiParams);
        }
        if (y < 2) {
            captureTile(matchId, x, y + 1, playerGotchiParams);
        }
    }

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

            // Logic to compare specific traits for capturing
            if (x != 0 && playerGotchiParams[3] > oppositeGotchiParams[1]) {
                // Left
                s.grids[matchId][y][x].winner = msg.sender;
            } else if (
                x + 1 < 3 && playerGotchiParams[1] > oppositeGotchiParams[3]
            ) {
                // Right
                s.grids[matchId][y][x].winner = msg.sender;
            } else if (
                y != 0 && playerGotchiParams[0] > oppositeGotchiParams[2]
            ) {
                // Up
                s.grids[matchId][y][x].winner = msg.sender;
            } else if (
                y + 1 < 3 && playerGotchiParams[2] > oppositeGotchiParams[0]
            ) {
                // Down
                s.grids[matchId][y][x].winner = msg.sender;
            }
        }
    }

    /// @dev Determines and handles the winner of the match.
    ///      This function is called when a match ends (all moves are played) to determine the winner,
    ///      calculate the prize, and transfer it to the winner.
    /// @param matchId The ID of the match for which to determine the winner.
    function checkWinner(uint256 matchId) internal {
        // Determine the winner based on points or other criteria
        address winner = determineWinner(matchId);

        // Calculate the prize amount
        uint256 prizeAmount = s.matches[matchId].betsize * 2 ether;
        s.playersAmountStaked -= prizeAmount;

        // Transfer the prize to the winner
        IERC20(s.dai).transfer(winner, prizeAmount);

        // Update match details
        s.matches[matchId].winner = winner;
    }

    function popArray(uint256[] storage _array, uint256 _index) internal {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    /// @dev Allows players to contest a match after a certain time period.
    /// @param matchId The ID of the match to be contested.
    function contestMatch(uint256 matchId) external {
        // Ensure enough time has passed since the last move.
        require(
            block.timestamp >= s.matches[matchId].lastMove + 600, // 10 minutes for testing, change to 3 days (259200 seconds) in production
            "GameFacet2: not enough time"
        );

        // Ensure the match has not been contested yet.
        require(!s.matches[matchId].contested, "GameFacet2: already contested");

        // Ensure that the sender is one of the players or the contract owner.
        require(
            msg.sender == s.matches[matchId].player1 ||
                msg.sender == s.matches[matchId].player2 ||
                msg.sender == LibDiamond.contractOwner(),
            "GameFacet2: you are not allowed"
        );

        // Calculate the winner's prize.
        uint256 winnerPrize = s.matches[matchId].betsize * 2 ether;
        s.playersAmountStaked -= winnerPrize;
        s.matches[matchId].contested = true;

        // Determine the winner based on who has the turn.
        address winner = s.matches[matchId].player2Turn
            ? s.matches[matchId].player1
            : s.matches[matchId].player2;
        IERC20(s.dai).transfer(winner, winnerPrize);
        s.matches[matchId].winner = winner;
    }
}
