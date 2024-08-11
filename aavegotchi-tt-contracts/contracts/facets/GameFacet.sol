// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {AppStorage, Room, Match, Tile, Modifiers} from "../libraries/AppStorage.sol";
import {IAavegotchiDiamond} from "../interfaces/IAavegotchiDiamond.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GameFacet is Modifiers {
    event RoomCreated(uint256 roomId, address indexed creator, uint256 betSize);
    event RoomJoined(uint256 roomId, address indexed opponent);
    event MatchGenerated(address player1, address player2, uint256 matchId);
    event RoomCancelled(uint256 roomId, address indexed creator);

    function createRoom(uint256[] calldata tokenIds, uint256 betSize) external {
        validateBetSize(betSize);
        require(tokenIds.length == 5, "GameFacet: Invalid number of tokens");
        validateTokenOwnership(tokenIds);
        validateTokenUniqueness(tokenIds);

        uint256 roomId = s.nextRoomId;

        s.rooms[roomId] = Room({
            creator: msg.sender,
            betSize: betSize,
            tokenIds: tokenIds,
            isActive: true
        });

        initializeGrid(roomId);

        s.nextRoomId++;

        handleBet(msg.sender, betSize);

        emit RoomCreated(roomId, msg.sender, betSize);
    }

    function joinRoom(uint256 roomId, uint256[] calldata tokenIds) external {
        Room storage room = s.rooms[roomId];
        require(room.isActive, "GameFacet: Room is not active");
        require(room.creator != address(0), "GameFacet: Room does not exist");
        require(
            room.creator != msg.sender,
            "GameFacet: Cannot join your own room"
        );
        require(tokenIds.length == 5, "GameFacet: Invalid number of tokens");
        validateTokenOwnership(tokenIds);
        validateTokenUniqueness(tokenIds);

        room.isActive = false; // Room is no longer active once the match is created

        uint256 matchId = s.nextId;
        s.nextId++;

        createMatch(room, matchId, tokenIds);

        handleBet(msg.sender, room.betSize);

        emit RoomJoined(roomId, msg.sender);
    }

    function cancelRoom(uint256 roomId) external {
        Room storage room = s.rooms[roomId];
        require(room.isActive, "GameFacet: Room is not active");
        require(
            room.creator == msg.sender,
            "GameFacet: Only the room creator can cancel the room"
        );

        room.isActive = false; // Deactivate the room before making external calls

        // Refund the bet amount to the room creator
        uint256 etherAmount = room.betSize * 1 ether; // Convert bet size to Ether equivalent
        IERC20(s.BetToken).transfer(room.creator, etherAmount);

        emit RoomCancelled(roomId, msg.sender);
    }

    function createMatch(
        Room storage room,
        uint256 matchId,
        uint256[] memory opponentTokens
    ) internal {
        s.matches[matchId] = Match({
            player1: room.creator,
            player2: msg.sender,
            player2Turn: false,
            contested: false,
            player1Gotchis: room.tokenIds,
            player2Gotchis: opponentTokens,
            betsize: room.betSize,
            lastMove: block.timestamp,
            movsCounter: 0,
            winner: address(0)
        });

        s.addressToMatchIds[room.creator].push(matchId);
        s.addressToMatchIds[msg.sender].push(matchId);

        emit MatchGenerated(room.creator, msg.sender, matchId);
    }

    function handleBet(address player, uint256 betSize) internal {
        uint256 etherAmount = betSize * 1 ether; // Convert bet size to Ether equivalent
        IERC20(s.BetToken).transferFrom(player, address(this), etherAmount);
    }

    function validateBetSize(uint256 betSize) internal pure {
        require(
            betSize == 0 ||
                betSize == 1 ||
                betSize == 5 ||
                betSize == 10 ||
                betSize == 25 ||
                betSize == 50 ||
                betSize == 100 ||
                betSize == 200 ||
                betSize == 500,
            "GameFacet: Invalid bet size"
        );
    }

    function validateTokenOwnership(uint256[] memory tokenIds) internal view {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                IAavegotchiDiamond(s.aavegotchiDiamond).ownerOf(tokenIds[i]) ==
                    msg.sender,
                "GameFacet: Not token owner"
            );
        }
    }

    function validateTokenUniqueness(uint256[] memory tokenIds) internal pure {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            for (uint256 j = i + 1; j < tokenIds.length; j++) {
                require(
                    tokenIds[i] != tokenIds[j],
                    "GameFacet: Duplicate tokenIds"
                );
            }
        }
    }

    function initializeGrid(uint256 roomId) internal {
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 3; j++) {
                s.grids[roomId][i][j] = Tile({
                    isActive: false,
                    tokenId: 0,
                    winner: address(0)
                });
            }
        }
    }
}
