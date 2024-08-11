import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer } from "@ethersproject/abstract-signer";
import { deployDiamond } from "../scripts/deploy";
import {
  GameFacet,
  GameFacet2,
  Owner,
  IERC20,
  IAavegotchiDiamond,
} from "../typechain";
import { impersonate } from "../scripts/utils";

let gameFacet: GameFacet;
let gameFacet2: GameFacet2;
let ownerFacet: Owner;
let aavegotchiContract: IAavegotchiDiamond;
let diamondAddress: any;
let accounts: Signer[];
let deployer: Signer;
let deployerAddress: string;
let alice: Signer;
let aliceAddress: string;
let ierc20: IERC20;
let deployerIerc20OriginalBalance: number;
let aliceIerc20OriginalBalance: number;
let player1Gotchis: number[];
let player2Gotchis: number[];
let player1GotchiParams: number[][];
let player2GotchiParams: number[][];

const GHST_ADDRESS = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";
const GHST_HOLDER_ADDRESS = "0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6"; // Replace with an address holding GHST

describe("Aavegotchi-tt Diamond with Real GHST", function () {
  before(async function () {
    // Deploy the diamond
    diamondAddress = await deployDiamond();

    // Get the facets
    gameFacet = await ethers.getContractAt("GameFacet", diamondAddress);
    gameFacet2 = await ethers.getContractAt("GameFacet2", diamondAddress);
    ownerFacet = await ethers.getContractAt("OwnershipFacet", diamondAddress);

    // Get the GHST contract
    ierc20 = await ethers.getContractAt("IERC20", GHST_ADDRESS);

    // Set GHST address in the diamond storage
    await ownerFacet.setGhstAddress(GHST_ADDRESS);

    // Get test accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    deployerAddress = await deployer.getAddress();
    alice = accounts[1];
    aliceAddress = await alice.getAddress();

    // Aavegotchi token IDs for testing
    player1Gotchis = [3052, 21424, 9358, 12409, 172];
    player2Gotchis = [22133, 1454, 21508, 22128, 2195];

    // Impersonate a GHST holder to transfer GHST to test accounts
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [GHST_HOLDER_ADDRESS],
    });

    const ghstHolderSigner = await ethers.getSigner(GHST_HOLDER_ADDRESS);

    // Transfer GHST to deployer and alice for testing
    await ierc20
      .connect(ghstHolderSigner)
      .transfer(deployerAddress, ethers.utils.parseEther("1000"));
    await ierc20
      .connect(ghstHolderSigner)
      .transfer(aliceAddress, ethers.utils.parseEther("1000"));

    // Stop impersonating the account
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [GHST_HOLDER_ADDRESS],
    });
  });

  it("Should create a room with a bet", async function () {
    const betSize = 500;
    const tokenIds = [1, 2, 3, 4, 5];

    // Approve tokens for betting
    await ierc20
      .connect(deployer)
      .approve(diamondAddress, ethers.utils.parseEther(betSize.toString()));

    // Create a room
    await gameFacet.connect(deployer).createRoom(tokenIds, betSize);

    // Check room state
    const roomId = 0;
    const room = await gameFacet.rooms(roomId);
    expect(room.creator).to.equal(deployerAddress);
    expect(room.betSize).to.equal(betSize);
    expect(room.isActive).to.be.true;
  });

  it("Should join a room and create a match", async function () {
    const betSize = 500;
    const tokenIds = [1, 2, 3, 4, 5];

    // Player1 creates a room
    await ierc20
      .connect(deployer)
      .approve(diamondAddress, ethers.utils.parseEther(betSize.toString()));
    await gameFacet.connect(deployer).createRoom(tokenIds, betSize);

    // Player2 approves and joins the room
    await ierc20
      .connect(alice)
      .approve(diamondAddress, ethers.utils.parseEther(betSize.toString()));
    await gameFacet.connect(alice).joinRoom(0, tokenIds);

    // Check the match state
    const matchId = 0;
    const matchDetails = await gameFacet.matches(matchId);
    expect(matchDetails.player1).to.equal(deployerAddress);
    expect(matchDetails.player2).to.equal(aliceAddress);
  });

  it("Should test playing cards and capturing tiles", async function () {
    // Setup initial match
    const betSize = 500;
    await ierc20
      .connect(deployer)
      .approve(diamondAddress, ethers.utils.parseEther(betSize.toString()));
    await gameFacet.connect(deployer).createRoom(player1Gotchis, betSize);

    await ierc20
      .connect(alice)
      .approve(diamondAddress, ethers.utils.parseEther(betSize.toString()));
    await gameFacet.connect(alice).joinRoom(0, player2Gotchis);

    // Play cards in turns
    await gameFacet2.connect(deployer).playCard(9358, 0, 0, 0); // Player 1
    await gameFacet2.connect(alice).playCard(21508, 0, 1, 1); // Player 2
    await gameFacet2.connect(deployer).playCard(21424, 0, 0, 1); // Player 1

    const grid = await gameFacet.getGrid(0);
    expect(grid[1][1].winner).to.be.equal(deployerAddress);
  });

  it("Should determine the winner of a match", async function () {
    // Simulate a complete match
    await gameFacet2.connect(alice).playCard(1454, 0, 1, 0); // Player 2
    await gameFacet2.connect(deployer).playCard(3052, 0, 2, 0); // Player 1
    await gameFacet2.connect(alice).playCard(2195, 0, 2, 1); // Player 2
    await gameFacet2.connect(deployer).playCard(172, 0, 2, 2); // Player 1
    await gameFacet2.connect(alice).playCard(22128, 0, 1, 2); // Player 2
    await gameFacet2.connect(deployer).playCard(12409, 0, 0, 2); // Player 1

    const match0 = await gameFacet.getMatch(0);
    expect(match0.winner).to.be.equal(deployerAddress);
  });

  it("Should test contest function", async function () {
    // Setup initial contest scenario
    await ierc20
      .connect(deployer)
      .approve(diamondAddress, ethers.utils.parseEther("200"));
    await gameFacet.connect(deployer).register(player1Gotchis, 200);

    await ierc20
      .connect(alice)
      .approve(diamondAddress, ethers.utils.parseEther("200"));
    await gameFacet.connect(alice).register(player2Gotchis, 200);

    await network.provider.send("evm_increaseTime", [86400]); // Fast forward time

    await gameFacet2.connect(alice).contestMatch(1);

    const match1 = await gameFacet.getMatch(1);
    expect(match1.winner).to.be.equal(aliceAddress);
    expect(match1.contested).to.be.true;
  });

  it("Should test owner withdraw function", async function () {
    let stakedAmount = await ownerFacet.checkPlayerStakedAmount();
    expect(stakedAmount).to.be.equal(0);

    await expect(ownerFacet.connect(alice).withdraw()).to.be.reverted; // Non-owner attempt

    const deployerIerc20OriginalBalance = await ierc20.balanceOf(
      deployerAddress
    );
    await ownerFacet.connect(deployer).withdraw();
    expect(await ierc20.balanceOf(deployerAddress)).to.be.gt(
      deployerIerc20OriginalBalance
    );
  });
});
