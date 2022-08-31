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
    event CardPlayed(uint256 indexed _matchId);

    function playCard(
        uint256 tokenId,
        uint256 matchId,
        uint256 x,
        uint256 y
    ) external {
        if (!s.matches[matchId].player2Turn) {
            require(
                msg.sender == s.matches[matchId].player1,
                "GameFacet: not player 1"
            );
            bool isInside;
            for (uint256 i; i < 5; i++) {
                if (tokenId == s.matches[matchId].player1Gotchis[i]) {
                    isInside = true;
                    popArray(s.matches[matchId].player1Gotchis, i);
                    break;
                }
            }
            require(isInside, "GameFacet: wrong card");
        } else {
            require(
                msg.sender == s.matches[matchId].player2,
                "GameFacet: not player 2"
            );
            bool isInside;
            for (uint256 i; i < 5; i++) {
                if (tokenId == s.matches[matchId].player2Gotchis[i]) {
                    isInside = true;
                    popArray(s.matches[matchId].player2Gotchis, i);
                    break;
                }
            }
            require(isInside, "GameFacet: wrong card");
        }
        require(x < 3, "GameFacet: wrong x");
        require(y < 3, "GameFacet: wrong y");
        require(!s.grids[matchId][y][x].isActive, "GameFacet: wrong coords");

        s.grids[matchId][y][x].isActive = true;
        s.grids[matchId][y][x].tokenId = tokenId;
        s.grids[matchId][y][x].winner = msg.sender;
        s.matches[matchId].movsCounter++;
        // check around
        int16[6] memory playerGotchiParams = IAavegotchiDiamond(
            s.aavegotchiDiamond
        ).getAavegotchi(tokenId).modifiedNumericTraits;
        int16[6] memory oppositeGotchiParams;

        if (
            x != 0 &&
            s.grids[matchId][y][x - 1].isActive &&
            s.grids[matchId][y][x - 1].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y][x - 1].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[3] > oppositeGotchiParams[1]) {
                s.grids[matchId][y][x - 1].winner = msg.sender;
            }
        }
        if (
            y != 0 &&
            s.grids[matchId][y - 1][x].isActive &&
            s.grids[matchId][y - 1][x].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y - 1][x].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[0] > oppositeGotchiParams[2]) {
                s.grids[matchId][y - 1][x].winner = msg.sender;
            }
        }
        if (
            x + 1 < 3 &&
            s.grids[matchId][y][x + 1].isActive &&
            s.grids[matchId][y][x + 1].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y][x + 1].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[1] > oppositeGotchiParams[3]) {
                s.grids[matchId][y][x + 1].winner = msg.sender;
            }
        }
        if (
            y + 1 < 3 &&
            s.grids[matchId][y + 1][x].isActive &&
            s.grids[matchId][y + 1][x].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][y + 1][x].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[2] > oppositeGotchiParams[0]) {
                s.grids[matchId][y + 1][x].winner = msg.sender;
            }
        }

        s.matches[matchId].player2Turn = !s.matches[matchId].player2Turn;
        s.matches[matchId].lastMove = block.timestamp;
        emit CardPlayed(matchId);

        if (s.matches[matchId].movsCounter == 9) {
            checkWinner(matchId);
            // IMPLEMENT POP MATCH IDS FROM MAPPING s.addressToMatchIds
        }
    }

    function checkWinner(uint256 matchId) internal {
        require(
            s.matches[matchId].contested != true,
            "GameFacet2: already contested"
        );
        s.matches[matchId].contested = true;
        uint256 player1Points;
        uint256 player2Points;
        uint256 winnerPrize = 0.2 ether; /* s.matches[matchId].betsize * 2 ether; */
        s.playersAmountStaked -= winnerPrize;
        for (uint256 i; i < 3; i++) {
            for (uint256 j; j < 3; j++) {
                if (s.grids[matchId][i][j].winner == s.matches[matchId].player1)
                    player1Points++;
                else if (
                    s.grids[matchId][i][j].winner == s.matches[matchId].player2
                ) player2Points++;
            }
        }
        if (player2Points < 4) {
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize,
                s.matches[matchId].player1
            );
            s.matches[matchId].winner = s.matches[matchId].player1;
        } else if (player2Points > 4) {
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize,
                s.matches[matchId].player2
            );
            s.matches[matchId].winner = s.matches[matchId].player2;
        } else if (player2Points == 4) {
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize / 2, /* s.matches[matchId].betsize * 1 ether, */
                s.matches[matchId].player1
            );
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize / 2, /* s.matches[matchId].betsize * 1 ether, */
                s.matches[matchId].player2
            );
        }
    }

    function popArray(uint256[] storage _array, uint256 _index) internal {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    function contestMatch(uint256 matchId) external {
        require(
            block.timestamp >= s.matches[matchId].lastMove + 600, /*  259200 (3 days) */
            "GameFacet2: not enough time"
        );
        require(
            s.matches[matchId].contested != true,
            "GameFacet2: already contested"
        );
        require(
            msg.sender == s.matches[matchId].player1 ||
                msg.sender == s.matches[matchId].player2 ||
                msg.sender == LibDiamond.contractOwner(),
            "GameFacet2: you are not allowed"
        );
        uint256 winnerPrize = 0.2 ether; /* s.matches[matchId].betsize * 2 ether; */ // this cause the bug
        s.playersAmountStaked -= winnerPrize;
        s.matches[matchId].contested = true;
        if (s.matches[matchId].player2Turn) {
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize,
                s.matches[matchId].player1
            );
            s.matches[matchId].winner = s.matches[matchId].player1;
        } else {
            IPool(s.aavePool).withdraw(
                s.dai,
                winnerPrize,
                s.matches[matchId].player2
            );
            s.matches[matchId].winner = s.matches[matchId].player2;
        }
    }
}
