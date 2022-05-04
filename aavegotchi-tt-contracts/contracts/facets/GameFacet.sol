// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile} from "../libraries/AppStorage.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "hardhat/console.sol";

contract GameFacet is Modifiers {
    function register(uint256[] calldata tokenIds, uint8 betsize) external {
        require(
            betsize == 1 || 
            betsize == 5 || 
            betsize == 10 || 
            betsize == 25 || 
            betsize == 50 || 
            betsize == 100 || 
            betsize == 200 || 
            betsize == 500, 
            "GameFacet: betsize doesn't exist"
        );

        for (uint256 i; i < 5; i++) {
             require(
                IAavegotchiDiamond(s.aavegotchiDiamond).ownerOf(tokenIds[i]) ==
                    msg.sender,
                "GameFacet: not owner"
            ); 
        }

        if (betsize == 1) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 1 ether);
            IPool(s.aavePool).supply(s.dai, 1 ether, address(this), 0);
            s.registered1.push(Register(msg.sender, tokenIds));
            if (s.registered1.length == 2) {
                _createMatch(
                    s.registered1[0].player,
                    msg.sender,
                    s.registered1[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered1.pop();
                s.registered1.pop();
            }
        }

        if (betsize == 5) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 5 ether);
            IPool(s.aavePool).supply(s.dai, 5 ether, address(this), 0);
            s.registered5.push(Register(msg.sender, tokenIds));
            if (s.registered5.length == 2) {
                _createMatch(
                    s.registered5[0].player,
                    msg.sender,
                    s.registered5[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered5.pop();
                s.registered5.pop();
            }
        }

        if (betsize == 10) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 10 ether);
            IPool(s.aavePool).supply(s.dai, 10 ether, address(this), 0);
            s.registered10.push(Register(msg.sender, tokenIds));
            if (s.registered10.length == 2) {
                _createMatch(
                    s.registered10[0].player,
                    msg.sender,
                    s.registered10[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered10.pop();
                s.registered10.pop();
            }
        }

        if (betsize == 25) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 25 ether);
            IPool(s.aavePool).supply(s.dai, 25 ether, address(this), 0);
            s.registered25.push(Register(msg.sender, tokenIds));
            if (s.registered25.length == 2) {
                _createMatch(
                    s.registered25[0].player,
                    msg.sender,
                    s.registered25[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered25.pop();
                s.registered25.pop();
            }
        }

        if (betsize == 50) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 50 ether);
            IPool(s.aavePool).supply(s.dai, 50 ether, address(this), 0);
            s.registered50.push(Register(msg.sender, tokenIds));
            if (s.registered50.length == 2) {
                _createMatch(
                    s.registered50[0].player,
                    msg.sender,
                    s.registered50[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered50.pop();
                s.registered50.pop();
            }
        }

        if (betsize == 100) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 100 ether);
            IPool(s.aavePool).supply(s.dai, 100 ether, address(this), 0);
            s.registered100.push(Register(msg.sender, tokenIds));
            if (s.registered100.length == 2) {
                _createMatch(
                    s.registered100[0].player,
                    msg.sender,
                    s.registered100[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered100.pop();
                s.registered100.pop();
            }
        }
        

        if (betsize == 200) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 200 ether);
            IPool(s.aavePool).supply(s.dai, 200 ether, address(this), 0);
            s.registered200.push(Register(msg.sender, tokenIds));
            if (s.registered200.length == 2) {
                _createMatch(
                    s.registered200[0].player,
                    msg.sender,
                    s.registered200[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered200.pop();
                s.registered200.pop();
            }
        }

        if (betsize == 500) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 500 ether);
            IPool(s.aavePool).supply(s.dai, 500 ether, address(this), 0);
            s.registered500.push(Register(msg.sender, tokenIds));
            if (s.registered500.length == 2) {
                _createMatch(
                    s.registered500[0].player,
                    msg.sender,
                    s.registered500[0].tokenIds,
                    tokenIds,
                    betsize
                );
                s.registered500.pop();
                s.registered500.pop();
            }
        }
    }

    function _createMatch(
        address player1,
        address player2,
        uint256[] memory player1Ids,
        uint256[] memory player2Ids,
        uint8 _betsize
    ) internal {
        Match memory newMatch = Match(
            player1,
            player2,
            false,
            player1Ids,
            player2Ids,
            0,
            _betsize,
            address(0)
        );
        s.matches[s.nextId] = newMatch;
        s.addressToMatchIds[player1].push(s.nextId);
        s.addressToMatchIds[player2].push(s.nextId);
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
            // IMPLEMENT POP MATCH IDS FROM MAPPING s.addressToMatchIds
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
            IPool(s.aavePool).withdraw(s.dai, s.matches[matchId].betsize * 2, s.matches[matchId].player1);
            s.matches[matchId].winner = s.matches[matchId].player1;
        } else {
            IPool(s.aavePool).withdraw(s.dai, s.matches[matchId].betsize * 2, s.matches[matchId].player2);
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
        address _aavePool,
        address _weth,
        address _swapRouter
    ) external onlyOwner {
        s.aavegotchiDiamond = _aavegotchiDiamond;
        s.dai = _DAI;
        s.aavePool = _aavePool;
        s.weth = _weth;
        s.swapRouterAddress = _swapRouter;
    }

    function approvePool() external onlyOwner {
        IERC20(s.dai).approve(s.aavePool, type(uint256).max);
    }

    function findPlayerMatches() external view returns(uint256[] memory) {
        return s.addressToMatchIds[msg.sender];
    }

/*     function swapExactInputSingle(uint256 amountIn) external payable returns (uint256 amountOut) {
        uint256 poolFee = 3000;
        ISwapRouter swapRouter = ISwapRouter(s.swapRouterAddress);
        IERC20 daiContract = IERC20(s.dai);

        // Transfer the specified amount of DAI to this contract.
        daiContract.transferFrom(msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        daiContract.approve(address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: s.dai,
                tokenOut: s.weth,
                fee: uint24(poolFee),
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    } */
}
