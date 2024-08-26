// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import {AppStorage, Modifiers, Match, Tile} from "../libraries/AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IERC20.sol";

contract GameFacet2 is Modifiers {
    event MatchContested(uint256 matchId, address winner);

    /// @notice Emitted when a card is played in a match.
    /// @param _matchId The ID of the match where the card is played.
    event CardPlayed(uint256 indexed _matchId);

    /// @notice Allows a player to play a card.
    /// @param tokenId The ID of the card being played.
    /// @param matchId The ID of the match.
    /// @param y The y-coordinate on the game grid where the card is played.
    /// @param x The x-coordinate on the game grid where the card is played.
    function playCard(
        uint256 tokenId,
        uint256 matchId,
        uint256 y,
        uint256 x
    ) external {
        validatePlayConditions(matchId, tokenId, x, y);
        updateGameGrid(matchId, tokenId, x, y);

        // Update the last move timestamp
        s.matches[matchId].lastMove = block.timestamp;

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
        // Ensure the match is still active and hasn't been contested or already has a winner.
        require(!s.matches[matchId].contested, "GameFacet: Match has been contested");
        require(s.matches[matchId].winner == address(0), "GameFacet: Match already has a winner");

        // Check if the coordinates are valid within the 3x3 grid
        require(x < 3 && y < 3, "GameFacet: Invalid coordinates");

        // Check if the spot on the grid is already taken
        require(!s.grids[matchId][y][x].isActive, "GameFacet: Spot already taken");

        // Check if it's the correct player's turn
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

        // console.log("winner: %s", s.grids[matchId][y][x].winner);
        s.matches[matchId].movsCounter++;

        // Get the traits of the played Gotchi
        int16[6] memory playerGotchiParams = IAavegotchiDiamond(
            s.aavegotchiDiamond
        ).getAavegotchi(tokenId).modifiedNumericTraits;

        // Apply the tile's bonus/malus to the relevant trait
        uint8 traitIndex = s.grids[matchId][y][x].bonusTraitIndex;
        playerGotchiParams[traitIndex] += int16(s.grids[matchId][y][x].bonus);

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
        // Use helper functions to reduce stack depth
        if (x > 0) {
            tryCaptureLeft(matchId, x, y, playerGotchiParams);
        }
        if (x < 2) {
            tryCaptureRight(matchId, x, y, playerGotchiParams);
        }
        if (y > 0) {
            tryCaptureUp(matchId, x, y, playerGotchiParams);
        }
        if (y < 2) {
            tryCaptureDown(matchId, x, y, playerGotchiParams);
        }
    }

    function tryCaptureLeft(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        captureTile(matchId, x - 1, y, playerGotchiParams, 3, 1);
    }

    function tryCaptureRight(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        captureTile(matchId, x + 1, y, playerGotchiParams, 1, 3);
    }

    function tryCaptureUp(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        captureTile(matchId, x, y - 1, playerGotchiParams, 0, 2);
    }

    function tryCaptureDown(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams
    ) internal {
        captureTile(matchId, x, y + 1, playerGotchiParams, 2, 0);
    }

    /// @dev Captures a tile if the played Gotchi's traits are favorable compared to the adjacent Gotchi.
    ///      This function is called for each adjacent tile of the played card to evaluate if it can be captured.
    /// @param matchId The ID of the current match.
    /// @param x The x-coordinate of the tile to potentially capture.
    /// @param y The y-coordinate of the tile to potentially capture.
    /// @param playerGotchiParams The traits of the played Gotchi used for comparison in capturing.
    /// @param playerTraitIndex Index of the player trait to compare.
    /// @param opponentTraitIndex Index of the opponent trait to compare.
    function captureTile(
        uint256 matchId,
        uint256 x,
        uint256 y,
        int16[6] memory playerGotchiParams,
        uint8 playerTraitIndex,
        uint8 opponentTraitIndex
    ) internal {
        if (
            s.grids[matchId][y][x].isActive &&
            s.grids[matchId][y][x].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y][x].tokenId;
            int16[6] memory oppositeGotchiParams = IAavegotchiDiamond(
                s.aavegotchiDiamond
            ).getAavegotchi(oppositeTokenId).modifiedNumericTraits;

            // Determine if the bonus/malus applies to the player's and opponent's trait
            int16 playerTraitWithBonus = playerGotchiParams[playerTraitIndex];
            int16 opponentTraitWithBonus = oppositeGotchiParams[opponentTraitIndex];

            // Convert the raw traits to game values using traitToValue
            int8 playerTraitValue = traitToValue(playerTraitWithBonus);
            int8 opponentTraitValue = traitToValue(opponentTraitWithBonus);

            // console.log("player trait value without bonus: ");
            // console.logInt(int(playerTraitValue));
            // console.log("opponent trait value without bonus: ");
            // console.logInt(int(opponentTraitValue));

            if (playerTraitIndex == s.grids[matchId][y][x].bonusTraitIndex) {
                playerTraitValue += int8(s.grids[matchId][y][x].bonus);
            }
            if (opponentTraitIndex == s.grids[matchId][y][x].bonusTraitIndex) {
                opponentTraitValue += int8(s.grids[matchId][y][x].bonus);
            }

            // Compare the values to determine the winner of the tile
            if (playerTraitValue > opponentTraitValue) {
                s.grids[matchId][y][x].winner = msg.sender;
            }

            // // Debug logs to ensure the calculations are correct
            // console.log("Tile coordinates: ", uint256(x), uint256(y));
            // console.log("Player trait value with bonus: ");
            // console.logInt(int(playerTraitValue));
            // console.log("Opponent trait value with bonus: ");
            // console.logInt(int(opponentTraitValue));
            // console.log("Tile winner after comparison: ", s.grids[matchId][y][x].winner);
        }
    }

    /// @dev Determines and handles the winner of the match.
    ///      This function is called when a match ends (all moves are played) to determine the winner,
    ///      calculate the prize, and transfer it to the winner.
    /// @param matchId The ID of the match for which to determine the winner.
    function checkWinner(uint256 matchId) internal {
        // Determine the winner based on points or other criteria
        address winner = determineWinner(matchId);

        // Handle prize distribution
        _handlePrizeDistribution(winner, s.matches[matchId].betsize);

        // Update match details
        s.matches[matchId].winner = winner;
    }

    /// @dev Determines the winner based on the number of tiles controlled by each player.
    /// @param matchId The ID of the match for which to determine the winner.
    /// @return winner The address of the winner.
    function determineWinner(
        uint256 matchId
    ) internal view returns (address winner) {
        Match storage matchData = s.matches[matchId];

        uint256 player1Tiles = 0;
        uint256 player2Tiles = 0;

        // Count tiles controlled by each player
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 3; j++) {
                Tile memory tile = s.grids[matchId][i][j];
                if (tile.winner == matchData.player1) {
                    player1Tiles++;
                } else if (tile.winner == matchData.player2) {
                    player2Tiles++;
                }
            }
        }

        // Determine winner based on tile control
        if (player1Tiles > player2Tiles) {
            winner = matchData.player1;
        } else if (player2Tiles > player1Tiles) {
            winner = matchData.player2;
        } else {
            winner = address(0); // Draw or no winner scenario
        }
    }

    function popArray(uint256[] storage _array, uint256 _index) internal {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    function traitToValue(int16 num) public pure returns (int8) {
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

    function contestMatch(uint256 matchId) external {
        Match storage matchData = s.matches[matchId];

        // Ensure the match is still active and hasn't been contested.
        require(!matchData.contested, "GameFacet: Match already contested");
        require(matchData.winner == address(0), "GameFacet: Match already has a winner");

        // Ensure enough time has passed since the last move or match start
        require(
            block.timestamp >= matchData.lastMove + 1 hours,
            "GameFacet: Not enough time has passed"
        );

        // Determine the current player
        address currentPlayer = matchData.movsCounter == 0 ? matchData.player2 : (matchData.player2Turn ? matchData.player2 : matchData.player1);

        // Ensure the caller is the correct player to contest.
        require(
            msg.sender == currentPlayer,
            "GameFacet: Only the correct player can contest"
        );

        // Declare the caller as the winner.
        matchData.winner = msg.sender;
        matchData.contested = true;

        // Handle prize distribution
        _handlePrizeDistribution(msg.sender, matchData.betsize);

        emit MatchContested(matchId, msg.sender);
    }

    function _handlePrizeDistribution(
        address winner,
        uint256 betSize
    ) internal {
            uint256 totalBetAmount = betSize * 2 ether;
            uint256 feeAmount = (totalBetAmount * s.feePercentage) / 100;
            uint256 prizeAmount = totalBetAmount - feeAmount;

        if (prizeAmount > 0) {
            // Deduct the prize amount from the total staked amount
            s.playersAmountStaked -= prizeAmount;

            // Transfer the prize to the winner
            IERC20(s.ghst).transfer(winner, prizeAmount);
        }
    }
}
