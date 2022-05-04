// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {LibDiamond} from "./LibDiamond.sol";

struct Tile {
    bool isActive;
    uint256 tokenId;
    address winner;
}

struct Match {
    address player1;
    address player2;
    bool player2Turn;
    uint256[] player1Gotchis;
    uint256[] player2Gotchis;
    uint8 movsCounter;
    uint8 betsize;
    address winner;
}

struct Register {
    address player;
    uint256[] tokenIds;
}

struct AppStorage {
    address aavegotchiDiamond;
    address dai;
    address aavePool;
    address weth; //added
    address swapRouterAddress; //added
    mapping(uint256 => Match) matches;
    mapping(uint256 => Tile[3][3]) grids;
    mapping(address => uint256[]) addressToMatchIds;
    uint256 nextId;
    Register[] registered1;
    Register[] registered5;
    Register[] registered10;
    Register[] registered25;
    Register[] registered50;
    Register[] registered100;
    Register[] registered200;
    Register[] registered500;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }
}

contract Modifiers {
    AppStorage internal s;

    modifier onlyOwner() {
        LibDiamond.enforceIsContractOwner();
        _;
    }
}
