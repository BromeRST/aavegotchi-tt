// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile, Register} from "../libraries/AppStorage.sol";
import "../interfaces/IAavegotchiDiamond.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "hardhat/console.sol";

/**
 * @title GameFacet
 * @dev This contract manages game matches, player registrations, and betting in a blockchain-based game environment.
 * It interacts with ERC20 tokens and external contracts for game functionalities.
 */
contract GameFacet is Modifiers {
    /**
     * @dev Registers players for a match with their token IDs and bet size.
     * @param tokenIds An array of token IDs representing the player's NFTs.
     * @param betSize The size of the bet placed by the player.
     */
    function register(uint256[] calldata tokenIds, uint256 betSize) external {
        validateBetSize(betSize);
        require(tokenIds.length == 5, "GameFacet: Invalid number of tokens");
        validateTokenOwnership(tokenIds);
        validateTokenUniqueness(tokenIds);

        handleBet(tokenIds, betSize);
    }

    /**
     * @dev Validates the bet size to ensure it's within the accepted range.
     * @param betSize The bet size to validate.
     */
    function validateBetSize(uint256 betSize) internal pure {
        require(
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

    /**
     * @dev Validates that the sender owns the tokens they are trying to register with.
     * @param tokenIds Array of token IDs to validate ownership of.
     */
    function validateTokenOwnership(uint256[] memory tokenIds) internal view {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                IAavegotchiDiamond(s.aavegotchiDiamond).ownerOf(tokenIds[i]) ==
                    msg.sender,
                "GameFacet: Not token owner"
            );
        }
    }

    /**
     * @dev Ensures all token (cards) IDs provided are unique and not repeated.
     * @param tokenIds Array of token (cards) IDs to check for uniqueness.
     */
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

    /**
     * @dev Handles the bet logic including token transfers and registration for matching.
     * @param tokenIds Array of player's token (cards) IDs.
     * @param betSize Size of the bet placed by the player.
     */
    function handleBet(uint256[] memory tokenIds, uint256 betSize) internal {
        uint256 etherAmount = betSize * 1 ether; // Convert bet size to Ether equivalent
        IERC20(s.dai).transferFrom(msg.sender, address(this), etherAmount);

        // Logic to push to the appropriate array based on betSize
        Register memory newRegistration = Register(msg.sender, tokenIds);
        // Logic to handle new registration based on betSize
        // Logic to create a match if enough players are registered

        createMatchIfReady(betSize);
    }

    /**
     * @dev Creates a match if there are enough registered players for the given bet size.
     * @param betSize The bet size for which to check the readiness of a match.
     */
    function createMatchIfReady(uint256 betSize) internal {
        // Implementation for checking registered players and creating a match
        if (s.registeredPlayers[betSize].length == 2) {
            address player1 = s.registeredPlayers[betSize][0];
            address player2 = s.registeredPlayers[betSize][1];
            uint256[] memory player1Ids = s.registeredPlayerIds[player1];
            uint256[] memory player2Ids = s.registeredPlayerIds[player2];
            _createMatch(player1, player2, player1Ids, player2Ids, betSize);
        }
    }

    /**
     * @dev Internal function to create a match between players.
     * @param player1 Address of the first player.
     * @param player2 Address of the second player.
     * @param player1Ids Array of token IDs for the first player.
     * @param player2Ids Array of token IDs for the second player.
     * @param betSize Size of the bet for the match.
     */
    function _createMatch(
        address player1,
        address player2,
        uint256[] memory player1Ids,
        uint256[] memory player2Ids,
        uint256 betSize
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

    /**
     * @dev Retrieves the grid state for a given match.
     * @param matchId The ID of the match.
     * @return A 3x3 grid representing the current state of the specified match.
     */
    function getGrid(
        uint256 matchId
    ) external view returns (Tile[3][3] memory) {
        return s.grids[matchId];
    }

    /**
     * @dev Retrieves match details for a given match ID.
     * @param matchId The ID of the match.
     * @return Match details including player addresses, bet size, etc.
     */
    function getMatch(uint256 matchId) external view returns (Match memory) {
        return s.matches[matchId];
    }

    /**
     * @dev Sets the addresses of various external contracts and tokens used in the game.
     * @param _aavegotchiDiamond Address of the Aavegotchi Diamond contract.
     * @param _BetERC20Token Address of the ERC20 token contract used to bet.
     * @param _weth Address of the WETH token contract.
     * @param _swapRouter Address of the Swap Router.
     */
    function setAddresses(
        address _aavegotchiDiamond,
        address _BetERC20Token,
    ) external onlyOwner {
        s.aavegotchiDiamond = _aavegotchiDiamond;
        s.BetToken = _BetERC20Token;
    }

    /**
     * @dev Finds all match IDs associated with the calling player.
     * @return An array of match IDs the player is involved in.
     */
    function findPlayerMatches() external view returns (uint256[] memory) {
        return s.addressToMatchIds[msg.sender];
    }

    /**
     * @dev Checks registered matches for the lowest bet size category.
     * @return An array of registrations for the lowest bet size category.
     */
    function checkRegisteredMatches()
        external
        view
        returns (Register[] memory)
    {
        return s.registered1;
    }
}
