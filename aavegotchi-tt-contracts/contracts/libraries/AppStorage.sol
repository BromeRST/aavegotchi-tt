// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "./LibDiamond.sol";

struct Tile {
    bool isActive;
    uint256 tokenId;
    address winner;
    int8 bonus; // The bonus or malus applied to the tile (can be positive or negative)
    uint8 bonusTraitIndex; // Index of the trait to which the bonus/malus applies
}

struct Match {
    address player1;
    address player2;
    bool player2Turn;
    bool contested;
    uint256[] player1Gotchis;
    uint256[] player2Gotchis;
    uint256 betsize;
    uint256 lastMove;
    uint8 movsCounter;
    address winner;
}

struct Room {
    address creator;
    uint256 betSize;
    uint256[] tokenIds;
    bool isActive;
}

struct AppStorage {
    address aavegotchiDiamond;
    address ghst;
    mapping(uint256 => Match) matches;
    mapping(uint256 => Tile[3][3]) grids;
    mapping(address => uint256[]) addressToMatchIds;
    mapping(uint256 => Room) rooms; // Added for rooms
    uint256 nextId;
    uint256 nextRoomId; // Added for room IDs
    uint256 playersAmountStaked;
    // Added for fees
    uint256 feePercentage;
    uint256 daoPercentage;
    uint256 softwareHousePercentage;
    uint256 developerPercentage;
    address daoAddress;
    address softwareHouseAddress;
    address developerAddress;
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
