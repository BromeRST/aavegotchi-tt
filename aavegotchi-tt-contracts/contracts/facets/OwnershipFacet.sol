// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IERC173} from "../interfaces/IERC173.sol";
import {AppStorage, Modifiers} from "../libraries/AppStorage.sol";

contract OwnershipFacet is IERC173, Modifiers {
    /// @notice Transfers ownership of the contract to a new owner.
    /// @param _newOwner The address of the new owner.
    function transferOwnership(address _newOwner) external override onlyOwner {
        LibDiamond.setContractOwner(_newOwner);
    }

    /// @notice Returns the address of the current owner.
    /// @return owner_ The address of the contract owner.
    function owner() external view override returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }

    /// @notice Sets the address of the GHST (or DAI) token.
    /// @param _ghst The address of the GHST token.
    function setGhstAddress(address _ghst) external onlyOwner {
        s.ghst = _ghst;
    }

    function initializeFeesAndAddresses(
        uint256 _feePercentage,
        uint256 _daoPercentage,
        uint256 _softwareHousePercentage,
        uint256 _developerPercentage,
        address _daoAddress,
        address _softwareHouseAddress,
        address _developerAddress
    ) external onlyOwner {
        s.feePercentage = _feePercentage;
        s.daoPercentage = _daoPercentage;
        s.softwareHousePercentage = _softwareHousePercentage;
        s.developerPercentage = _developerPercentage;
        s.daoAddress = _daoAddress;
        s.softwareHouseAddress = _softwareHouseAddress;
        s.developerAddress = _developerAddress;
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        s.feePercentage = _feePercentage;
    }

    function setDaoPercentage(uint256 _daoPercentage) external onlyOwner {
        s.daoPercentage = _daoPercentage;
    }

    function setSoftwareHousePercentage(
        uint256 _softwareHousePercentage
    ) external onlyOwner {
        s.softwareHousePercentage = _softwareHousePercentage;
    }

    function setDeveloperPercentage(
        uint256 _developerPercentage
    ) external onlyOwner {
        s.developerPercentage = _developerPercentage;
    }

    function setDaoAddress(address _daoAddress) external onlyOwner {
        s.daoAddress = _daoAddress;
    }

    function setSoftwareHouseAddress(
        address _softwareHouseAddress
    ) external onlyOwner {
        s.softwareHouseAddress = _softwareHouseAddress;
    }

    function setDeveloperAddress(address _developerAddress) external onlyOwner {
        s.developerAddress = _developerAddress;
    }
}
