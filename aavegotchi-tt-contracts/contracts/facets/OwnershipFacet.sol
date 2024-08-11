// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IERC173} from "../interfaces/IERC173.sol";
import {AppStorage} from "../libraries/AppStorage.sol";

contract OwnershipFacet is IERC173 {
    AppStorage internal s; // Access to the shared storage

    /// @notice Transfers ownership of the contract to a new owner.
    /// @param _newOwner The address of the new owner.
    function transferOwnership(address _newOwner) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    /// @notice Returns the address of the current owner.
    /// @return owner_ The address of the contract owner.
    function owner() external view override returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }

    /// @notice Sets the address of the GHST (or DAI) token.
    /// @param _ghst The address of the GHST token.
    function setGhstAddress(address _ghst) external {
        LibDiamond.enforceIsContractOwner();
        s.ghst = _ghst;
    }
}
