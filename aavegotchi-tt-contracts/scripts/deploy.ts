import { Signer } from "@ethersproject/abstract-signer";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { network, ethers } from "hardhat";
import {
  DiamondCutFacet,
  DiamondInit__factory,
  Diamond__factory,
  OwnershipFacet,
  GameFacet,
  IERC721,
  IERC20,
} from "../typechain";

const { getSelectors, FacetCutAction } = require("./libraries/diamond");

const gasPrice = 35000000000;

export async function deployDiamond() {
  const accounts: Signer[] = await ethers.getSigners();
  const deployer = accounts[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer:", deployerAddress);

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy({ gasPrice });
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond
  const Diamond = (await ethers.getContractFactory(
    "Diamond"
  )) as Diamond__factory;
  const diamond = await Diamond.deploy(
    deployerAddress,
    diamondCutFacet.address,
    { gasPrice }
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  const DiamondInit = (await ethers.getContractFactory(
    "DiamondInit"
  )) as DiamondInit__factory;
  const diamondInit = await DiamondInit.deploy({ gasPrice });
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "GameFacet"];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy({ gasPrice });
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond.address
  )) as DiamondCutFacet;

  // call to init function
  const functionCall = diamondInit.interface.encodeFunctionData("init");
  const tx = await diamondCut.diamondCut(
    cut,
    diamondInit.address,
    functionCall,
    { gasPrice }
  );
  console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");

  const ownershipFacet = (await ethers.getContractAt(
    "OwnershipFacet",
    diamond.address
  )) as OwnershipFacet;
  const diamondOwner = await ownershipFacet.owner();
  console.log("Diamond owner is:", diamondOwner);

  if (diamondOwner !== deployerAddress) {
    throw new Error(
      `Diamond owner ${diamondOwner} is not deployer address ${deployerAddress}!`
    );
  }

  const gameFacet = (await ethers.getContractAt(
    "GameFacet",
    diamond.address
  )) as GameFacet;

  await gameFacet.setAddresses(
    "0x86935F11C86623deC8a25696E1C19a8659CbF95d",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
  );

  // const ierc721 = (await ethers.getContractAt(
  //   "IERC721",
  //   "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
  // )) as IERC721;

  await gameFacet.approvePool();

  // await network.provider.request({
  //     method: "hardhat_impersonateAccount",
  //     params: ["0xd9d54f0f67fde251ab41ffb36579f308b592d905"],
  //   });

  // const signer = await ethers.getSigner("0xd9d54f0f67fde251ab41ffb36579f308b592d905")

  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 3052)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 21424)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 9358)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 12409)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 172)

  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 22133)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1454)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 21508)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 22128)
  // await ierc721.connect(signer)["safeTransferFrom(address,address,uint256)"](signer.address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 2195)

  // await network.provider.request({
  //   method: "hardhat_stopImpersonatingAccount",
  //   params: ["0xd9d54f0f67fde251ab41ffb36579f308b592d905"],
  // });

  // await network.provider.request({
  //   method: "hardhat_impersonateAccount",
  //   params: ["0x06959153B974D0D5fDfd87D561db6d8d4FA0bb0B"],
  // });

  // const signer2 = await ethers.getSigner("0x06959153B974D0D5fDfd87D561db6d8d4FA0bb0B");

  // const ierc20 = (await ethers.getContractAt(
  //   "IERC20",
  //   "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  // )) as IERC20;

  // await ierc20.connect(signer2).transfer("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ethers.utils.parseUnits("10000", "ether"));
  // await ierc20.connect(signer2).transfer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", ethers.utils.parseUnits("10000", "ether"));

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
