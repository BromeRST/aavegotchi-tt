// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile} from "../libraries/AppStorage.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "hardhat/console.sol";

contract GameFacet is Modifiers {

    event MatchGenerated(address indexed _player1, address indexed _player2, uint256 _matchId);

    function register(uint256[] calldata tokenIds, uint256 betsize) external {
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

        require(
            tokenIds[0] != tokenIds[1] &&
            tokenIds[0] != tokenIds[2] &&
            tokenIds[0] != tokenIds[3] &&
            tokenIds[0] != tokenIds[4] &&
            tokenIds[1] != tokenIds[2] &&
            tokenIds[1] != tokenIds[3] &&
            tokenIds[1] != tokenIds[4] &&
            tokenIds[2] != tokenIds[3] &&
            tokenIds[2] != tokenIds[4] &&
            tokenIds[3] != tokenIds[4],
            "GameFacet: same tokenId" 
        );

        if (betsize == 1) {
            IERC20(s.dai).transferFrom(msg.sender, address(this), 1 ether);
            IPool(s.aavePool).supply(s.dai, 1 ether, address(this), 0);
            s.registered1.push(Register(msg.sender, tokenIds));
            s.playersAmountStaked += 1 ether;
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
            s.playersAmountStaked += 5 ether;
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
            s.playersAmountStaked += 10 ether;
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
            s.playersAmountStaked += 25 ether;
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
            s.playersAmountStaked += 50 ether;
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
            s.playersAmountStaked += 100 ether;
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
            s.playersAmountStaked += 200 ether;
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
            s.playersAmountStaked += 500 ether;
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
        uint256 _betsize
    ) internal {
        Match memory newMatch = Match(
            player1,
            player2,
            false,
            false,
            player1Ids,
            player2Ids,
            _betsize,
            block.timestamp,
            0,
            address(0)
        );
        s.matches[s.nextId] = newMatch;
        s.addressToMatchIds[player1].push(s.nextId);
        s.addressToMatchIds[player2].push(s.nextId);
        emit MatchGenerated(player1, player2, s.nextId);
        s.nextId++;
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

}
