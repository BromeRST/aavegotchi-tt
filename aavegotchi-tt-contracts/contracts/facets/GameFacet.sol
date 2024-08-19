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

        // Initialize the grid with bonuses/maluses using the opponent's traits as a randomness source
        int16[6] memory opponentTraits = IAavegotchiDiamond(s.aavegotchiDiamond)
            .getAavegotchi(tokenIds[0])
            .modifiedNumericTraits;

        initializeGridWithBonuses(matchId, opponentTraits);

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
        IERC20(s.ghst).transfer(room.creator, etherAmount);

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
        uint256 feeAmount = (etherAmount * s.feePercentage) / 100;
        uint256 netBetAmount = etherAmount - feeAmount;

        // Collect the fee
        if (feeAmount > 0) {
            uint256 daoShare = (feeAmount * s.daoPercentage) / s.feePercentage;
            uint256 softwareHouseShare = (feeAmount *
                s.softwareHousePercentage) / s.feePercentage;
            uint256 developerShare = (feeAmount * s.developerPercentage) /
                s.feePercentage;

            // Transfer the fee to respective addresses
            IERC20(s.ghst).transferFrom(player, s.daoAddress, daoShare);
            IERC20(s.ghst).transferFrom(
                player,
                s.softwareHouseAddress,
                softwareHouseShare
            );
            IERC20(s.ghst).transferFrom(
                player,
                s.developerAddress,
                developerShare
            );
        }

        // Transfer the remaining bet amount to the contract as the prize pool
        IERC20(s.ghst).transferFrom(player, address(this), netBetAmount);
        s.playersAmountStaked += netBetAmount;
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

    function initializeGridWithBonuses(
        uint256 matchId,
        int16[6] memory playerTraits
    ) internal {
        uint256 randomSeed = getRandomNumber(matchId, playerTraits); // Use player traits as part of the seed

        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 3; j++) {
                // Generate a random bonus/malus (0 means no effect)
                int8 bonus = int8(
                    int256(getRandomNumber(randomSeed, playerTraits) % 5) - 2
                ); // -2 to 2

                // Randomly select which trait to apply this bonus/malus to (0 to 5, representing the 6 traits)
                uint256 randomTraitIndex = getRandomNumber(
                    randomSeed,
                    playerTraits
                ) % 6;

                s.grids[matchId][i][j] = Tile({
                    isActive: false,
                    tokenId: 0,
                    winner: address(0),
                    bonus: bonus,
                    bonusTraitIndex: uint8(randomTraitIndex) // New field for trait index
                });

                // Update the seed for the next tile
                randomSeed = getRandomNumber(randomSeed, playerTraits);
            }
        }
    }

    function getRandomNumber(
        uint256 seed,
        int16[6] memory traits
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        seed,
                        traits
                    )
                )
            );
    }
}
