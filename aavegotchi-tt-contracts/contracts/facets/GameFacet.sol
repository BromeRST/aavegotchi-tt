// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile} from "../libraries/AppStorage.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IERC20.sol";

contract GameFacet is Modifiers {
    function register(uint256[] calldata tokenIds) external {
        IERC20(s.dai).transferFrom(msg.sender, address(this), 1);
        IPool(s.aavePool).supply(s.dai, 1, address(this), 0);
        /*for (uint256 i; i < 5; i++) {
             require(
                IAavegotchiDiamond(s.aavegotchiDiamond).ownerOf(tokenIds[i]) ==
                    msg.sender,
                "GameFacet: not owner"
            ); 
        }*/
        s.registered.push(Register(msg.sender, tokenIds));
        if (s.registered.length == 2) {
            _createMatch(
                s.registered[0].player,
                msg.sender,
                s.registered[0].tokenIds,
                tokenIds
            );
            s.registered.pop();
            s.registered.pop();
        }
    }

    function _createMatch(
        address player1,
        address player2,
        uint256[] memory player1Ids,
        uint256[] memory player2Ids
    ) internal {
        Match memory newMatch = Match(
            player1,
            player2,
            false,
            player1Ids,
            player2Ids,
            0,
            address(0)
        );
        s.matches[s.nextId] = newMatch;
        s.nextId++;
    }

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
            // bool isInside;
            // for (uint256 i; i < 5; i++) {
            //     if (tokenId == s.matches[matchId].player1Gotchis[i]) {
            //         isInside = true;
            //         popArray(s.matches[matchId].player1Gotchis, i);
            //     }
            // }
            // require(isInside, "GameFacet: wrong card");
        } else {
            require(
                msg.sender == s.matches[matchId].player2,
                "GameFacet: not player 2"
            );
            // bool isInside;
            // for (uint256 i; i < 5; i++) {
            //     if (tokenId == s.matches[matchId].player2Gotchis[i]) {
            //         isInside = true;
            //         popArray(s.matches[matchId].player2Gotchis, i);
            //     }
            // }
            // require(isInside, "GameFacet: wrong card");
        }
        require(x < 3, "GameFacet: wrong x");
        require(y < 3, "GameFacet: wrong y");
        require(!s.grids[matchId][x][y].isActive, "GameFacet: wrong coords");

        s.grids[matchId][x][y].isActive = true;
        s.grids[matchId][x][y].tokenId = tokenId;
        s.grids[matchId][x][y].winner = msg.sender;
        s.matches[matchId].movsCounter++;
        // check around
        int16[6] memory playerGotchiParams = IAavegotchiDiamond(
            s.aavegotchiDiamond
        ).getAavegotchi(tokenId).modifiedNumericTraits;
        int16[6] memory oppositeGotchiParams;

        if (
            y != 0 &&
            s.grids[matchId][x][y - 1].isActive &&
            s.grids[matchId][x][y - 1].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][x][y - 1].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[0] > oppositeGotchiParams[2]) {
                s.grids[matchId][x][y - 1].winner = msg.sender;
            }
        }
        if (
            x != 0 &&
            s.grids[matchId][x - 1][y].isActive &&
            s.grids[matchId][x - 1][y].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][x - 1][y].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[3] > oppositeGotchiParams[1]) {
                s.grids[matchId][x - 1][y].winner = msg.sender;
            }
        }
        if (
            y + 1 < 3 &&
            s.grids[matchId][x][y + 1].isActive &&
            s.grids[matchId][x][y + 1].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][x][y + 1].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[2] > oppositeGotchiParams[0]) {
                s.grids[matchId][x][y + 1].winner = msg.sender;
            }
        }
        if (
            x + 1 < 3 &&
            s.grids[matchId][x + 1][y].isActive &&
            s.grids[matchId][x + 1][y].winner != msg.sender
        ) {
            uint256 oppositeTokenId = s.grids[matchId][x + 1][y].tokenId;
            oppositeGotchiParams = IAavegotchiDiamond(s.aavegotchiDiamond)
                .getAavegotchi(oppositeTokenId)
                .modifiedNumericTraits;
            if (playerGotchiParams[1] > oppositeGotchiParams[3]) {
                s.grids[matchId][x + 1][y].winner = msg.sender;
            }
        }

        s.matches[matchId].player2Turn = !s.matches[matchId].player2Turn;

        if (s.matches[matchId].movsCounter == 9) {
            checkWinner(matchId);
        }
    }

    function checkWinner(uint256 matchId) internal {
        uint256 player1Points;
        uint256 player2Points;
        for (uint256 i; i < 3; i++) {
            for (uint256 j; j < 3; j++) {
                if (s.grids[matchId][i][j].winner == s.matches[matchId].player1)
                    player1Points++;
                else if (
                    s.grids[matchId][i][j].winner == s.matches[matchId].player2
                ) player2Points++;
            }
        }
        if (player1Points > player2Points && player1Points > 5) {
            IPool(s.aavePool).withdraw(s.dai, 2, s.matches[matchId].player1);
            s.matches[matchId].winner = s.matches[matchId].player1;
        } else {
            IPool(s.aavePool).withdraw(s.dai, 2, s.matches[matchId].player2);
            s.matches[matchId].winner = s.matches[matchId].player2;
        }
    }

    function popArray(uint256[] storage _array, uint256 _index) internal {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    function getGrid(uint256 matchId)
        external
        view
        returns (Tile[3][3] memory)
    {
        return s.grids[matchId];
    }

    function getMatch(uint256 matchId) external view returns (Match memory) {
        return s.matches[matchId];
    }

    function setAddresses(
        address _aavegotchiDiamond,
        address _DAI,
        address _aavePool
    ) external onlyOwner {
        s.aavegotchiDiamond = _aavegotchiDiamond;
        s.dai = _DAI;
        s.aavePool = _aavePool;
    }

    function approvePool() external onlyOwner {
        IERC20(s.dai).approve(s.aavePool, type(uint256).max);
    }
}
