import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "hardhat";
import {
  DiamondCutFacet,
  DiamondInit__factory,
  Diamond__factory,
  OwnershipFacet,
  GameFacet,
  GameFacet2,
} from "../typechain";
import { BUILDER_ADDRESS, DAO_ADDRESS, SOFTWARE_HOUSE_ADDRESS } from "../lib";

const { getSelectors, FacetCutAction } = require("./libraries/diamond");

export async function deployDiamond() {
  const accounts: Signer[] = await ethers.getSigners();
  const deployer = accounts[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer:", deployerAddress);

  // Deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // Deploy Diamond
  const Diamond = (await ethers.getContractFactory(
    "Diamond"
  )) as Diamond__factory;
  const diamond = await Diamond.deploy(
    deployerAddress,
    diamondCutFacet.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // Deploy DiamondInit
  const DiamondInit = (await ethers.getContractFactory(
    "DiamondInit"
  )) as DiamondInit__factory;
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // Deploy facets
  console.log("Deploying facets");
  const FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "GameFacet",
    "GameFacet2",
    "GettersFacet",
  ];

  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamond.address);

  // Call to init function
  const functionCall = diamondInit.interface.encodeFunctionData("init");
  const tx = await diamondCut.diamondCut(
    cut,
    diamondInit.address,
    functionCall
  );
  console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");

  // Check diamond ownership
  const ownershipFacet = await ethers.getContractAt(
    "OwnershipFacet",
    diamond.address
  );
  const diamondOwner = await ownershipFacet.owner();
  console.log("Diamond owner is:", diamondOwner);

  if (diamondOwner !== deployerAddress) {
    throw new Error(
      `Diamond owner ${diamondOwner} is not deployer address ${deployerAddress}!`
    );
  }

  // Set GHST address using the ownership facet
  await ownershipFacet.setAddresses(
    "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7",
    "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
  ); // Replace with actual GHST address
  console.log("GHST address set in OwnershipFacet.");

  // Initialize fees and addresses
  await ownershipFacet.initializeFeesAndAddresses(
    3, // 3% total fee
    1, // 1% to DAO
    1, // 1% to software house
    1, // 1% to developer
    DAO_ADDRESS, // Replace with actual DAO address
    SOFTWARE_HOUSE_ADDRESS, // Replace with actual Software House address
    BUILDER_ADDRESS // Replace with actual Developer address
  );
  console.log("Fees and addresses initialized in OwnershipFacet.");

  console.log("Diamond deployed at:", diamond.address);

  return diamond.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
