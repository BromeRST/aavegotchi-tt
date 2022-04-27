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
    mapping(uint256 => Match) matches;
    mapping(uint256 => Tile[3][3]) grids;
    uint256 nextId;
    Register[] registered;
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
