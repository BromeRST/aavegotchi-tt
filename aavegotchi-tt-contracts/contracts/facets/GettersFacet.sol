// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AppStorage, Modifiers, Room, Match, Tile } from "../libraries/AppStorage.sol";

contract GettersFacet is Modifiers {
    // Get the address of the GHST token
    function getGhstToken() external view returns (address) {
        return s.ghst;
    }

    // Get a specific match by its ID
    function getMatch(uint256 matchId) external view returns (Match memory) {
        return s.matches[matchId];
    }

    // Get a specific room by its ID
    function getRoom(uint256 roomId) external view returns (Room memory) {
        return s.rooms[roomId];
    }

    // Get the grid for a specific match ID
    function getGrid(uint256 matchId) external view returns (Tile[3][3] memory) {
        return s.grids[matchId];
    }

    // Get the match IDs associated with a specific address
    function getAddressToMatchIds(address player) external view returns (uint256[] memory) {
        return s.addressToMatchIds[player];
    }

    // Get the next match ID
    function getNextMatchId() external view returns (uint256) {
        return s.nextId;
    }

    // Get the next room ID
    function getNextRoomId() external view returns (uint256) {
        return s.nextRoomId;
    }

    // Get the total amount staked by players
    function getPlayersAmountStaked() external view returns (uint256) {
        return s.playersAmountStaked;
    }

    // Get all unfilled rooms (rooms that are still active)
    function getAllUnfilledRooms() external view returns (Room[] memory) {
        uint256 count = 0;

        // First, count how many unfilled rooms there are
        for (uint256 i = 0; i < s.nextRoomId; i++) {
            if (s.rooms[i].isActive) {
                count++;
            }
        }

        // Create an array with the appropriate size
        Room[] memory unfilledRooms = new Room[](count);
        uint256 index = 0;

        // Populate the array with unfilled rooms
        for (uint256 i = 0; i < s.nextRoomId; i++) {
            if (s.rooms[i].isActive) {
                unfilledRooms[index] = s.rooms[i];
                index++;
            }
        }

        return unfilledRooms;
    }

    // Get all unfinished matches (matches that have no winner yet)
    function getAllUnfinishedMatches() external view returns (Match[] memory) {
        uint256 count = 0;

        // First, count how many unfinished matches there are
        for (uint256 i = 0; i < s.nextId; i++) {
            if (s.matches[i].winner == address(0)) {
                count++;
            }
        }

        // Create an array with the appropriate size
        Match[] memory unfinishedMatches = new Match[](count);
        uint256 index = 0;

        // Populate the array with unfinished matches
        for (uint256 i = 0; i < s.nextId; i++) {
            if (s.matches[i].winner == address(0)) {
                unfinishedMatches[index] = s.matches[i];
                index++;
            }
        }

        return unfinishedMatches;
    }
}
