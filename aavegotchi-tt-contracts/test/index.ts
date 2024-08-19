import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer } from "@ethersproject/abstract-signer";
import { deployDiamond } from "../scripts/deploy";
import {
  GameFacet,
  GameFacet2,
  OwnershipFacet,
  GettersFacet,
  IERC20,
  IAavegotchiDiamond,
} from "../typechain";
import { impersonate } from "../scripts/utils";
import { DAO_ADDRESS, BUILDER_ADDRESS, SOFTWARE_HOUSE_ADDRESS } from "../lib";

let gameFacet: GameFacet;
let gameFacet2: GameFacet2;
let ownerFacet: OwnershipFacet;
let gettersFacet: GettersFacet;
let aavegotchiContract: IAavegotchiDiamond;
let diamondAddress: any;
let accounts: Signer[];
let deployer: Signer;
let deployerAddress: string;
let alice: Signer;
let aliceAddress: string;
let GHST: IERC20;
let deployerGhstOriginalBalance: number;
let aliceGhstOriginalBalance: number;
let player1Gotchis: number[];
let player2Gotchis: number[];
let player1GotchiParams: number[][] = [];
let player2GotchiParams: number[][] = [];

describe("Aavegotchi-tt with Fees and Bonuses/Maluses", function () {
  before(async function () {
    diamondAddress = await deployDiamond();

    gameFacet = (await ethers.getContractAt(
      "GameFacet",
      diamondAddress
    )) as GameFacet;

    gameFacet2 = (await ethers.getContractAt(
      "GameFacet2",
      diamondAddress
    )) as GameFacet2;

    ownerFacet = (await ethers.getContractAt(
      "OwnershipFacet",
      diamondAddress
    )) as OwnershipFacet;

    gettersFacet = (await ethers.getContractAt(
      "GettersFacet",
      diamondAddress
    )) as GettersFacet;

    GHST = (await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7"
    )) as IERC20;

    aavegotchiContract = (await ethers.getContractAt(
      "IAavegotchiDiamond",
      "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    )) as IAavegotchiDiamond;

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    deployerAddress = await deployer.getAddress();
    alice = accounts[1];
    aliceAddress = await alice.getAddress();

    // Impersonate the GHST holder to distribute GHST
    const ghstHolder = "0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ghstHolder],
    });

    const ghstSigner = await ethers.getSigner(ghstHolder);

    // Transfer GHST to the players
    await GHST.connect(ghstSigner).transfer(
      deployerAddress,
      ethers.utils.parseUnits("1000", "ether")
    );

    await GHST.connect(ghstSigner).transfer(
      aliceAddress,
      ethers.utils.parseUnits("1000", "ether")
    );

    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [ghstHolder],
    });

    // Impersonate the Gotchi holder to distribute Gotchis
    const gotchiHolder = "0xAd0CEb6Dc055477b8a737B630D6210EFa76a2265";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [gotchiHolder],
    });

    const gotchiSigner = await ethers.getSigner(gotchiHolder);

    // Initialize the player1Gotchis and player2Gotchis arrays
    player1Gotchis = [];
    player2Gotchis = [];

    // Distribute Gotchis to player 1 (deployer) and player 2 (alice)
    const allGotchis = [
      15515, 21615, 11662, 16102, 23022, 23482, 10579, 18793, 24007, 4160,
    ];

    console.log("sending gotchis");

    for (let i = 0; i < allGotchis.length; i++) {
      if (i < 5) {
        // First 5 Gotchis go to player 1 (deployer)
        await aavegotchiContract
          .connect(gotchiSigner)
          .safeTransferFrom(gotchiHolder, deployerAddress, allGotchis[i]);
        player1Gotchis.push(allGotchis[i]);
      } else {
        // Next 5 Gotchis go to player 2 (alice)
        await aavegotchiContract
          .connect(gotchiSigner)
          .safeTransferFrom(gotchiHolder, aliceAddress, allGotchis[i]);
        player2Gotchis.push(allGotchis[i]);
      }
    }

    console.log("gotchis sent");

    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [gotchiHolder],
    });

    // Initialize fees and addresses
    await ownerFacet.initializeFeesAndAddresses(
      3, // 3% fee
      1, // 1% to DAO
      1, // 1% to software house
      1, // 1% to developer
      DAO_ADDRESS, // Replace with actual DAO address
      SOFTWARE_HOUSE_ADDRESS, // Replace with actual Software House address
      BUILDER_ADDRESS // Replace with actual Developer address
    );

    // Optionally fetch the traits here if needed for advanced tests
    for (let i = 0; i < player1Gotchis.length; i++) {
      let aavegotchiInfo = await aavegotchiContract.getAavegotchi(
        player1Gotchis[i]
      );
      player1GotchiParams.push(aavegotchiInfo.modifiedNumericTraits);
      let aavegotchiInfo2 = await aavegotchiContract.getAavegotchi(
        player2Gotchis[i]
      );
      player2GotchiParams.push(aavegotchiInfo2.modifiedNumericTraits);
    }
  });

  it("Should test room creation with fee deduction", async function () {
    await GHST.approve(
      diamondAddress,
      ethers.utils.parseUnits("100000000000000000000000000", "ether")
    );

    console.log("ghst approved");

    deployerGhstOriginalBalance = parseInt(
      ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress))
    );

    console.log("deployer balance", deployerGhstOriginalBalance);

    await gameFacet.createRoom(player1Gotchis, 500);

    console.log("room created");

    const expectedBalance = deployerGhstOriginalBalance - 500;

    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress)))
    ).to.be.equal(expectedBalance);
  });

  it("Should apply fees correctly when the match is created", async function () {
    const initialDaoBalance = await GHST.balanceOf(DAO_ADDRESS);
    const initialSoftwareHouseBalance = await GHST.balanceOf(
      SOFTWARE_HOUSE_ADDRESS
    );
    const initialDeveloperBalance = await GHST.balanceOf(BUILDER_ADDRESS);

    // Join room as Alice
    gameFacet = await impersonate(aliceAddress, gameFacet, ethers, network);
    GHST = await impersonate(aliceAddress, GHST, ethers, network);
    await GHST.approve(
      diamondAddress,
      ethers.utils.parseUnits("100000000000000000000000000", "ether")
    );
    await gameFacet.joinRoom(0, player2Gotchis);

    const totalFee = ethers.utils.parseUnits("500", "ether").mul(3).div(100); // This converts the fee calculation to BigNumber

    const expectedDaoBalance = initialDaoBalance.add(totalFee.div(3));
    const expectedSoftwareHouseBalance = initialSoftwareHouseBalance.add(
      totalFee.div(3)
    );
    const expectedDeveloperBalance = initialDeveloperBalance.add(
      totalFee.div(3)
    );

    expect(await GHST.balanceOf(DAO_ADDRESS)).to.be.equal(expectedDaoBalance);
    expect(await GHST.balanceOf(SOFTWARE_HOUSE_ADDRESS)).to.be.equal(
      expectedSoftwareHouseBalance
    );
    expect(await GHST.balanceOf(BUILDER_ADDRESS)).to.be.equal(
      expectedDeveloperBalance
    );
  });

  it("Should check match at index 0 with bonuses/maluses applied", async function () {
    const aliceMatchesBigN = await gettersFacet.getAddressToMatchIds(
      aliceAddress
    );
    const aliceMatches = [];

    for (let i = 0; i < aliceMatchesBigN.length; i++) {
      aliceMatches.push(
        parseInt(ethers.utils.formatUnits(aliceMatchesBigN[i], 0))
      );
    }

    expect(aliceMatches).to.be.eql([0]);
    const match0 = await gettersFacet.getMatch(0);

    expect(match0.player1).to.be.equal(deployerAddress);
    expect(match0.player2).to.be.equal(aliceAddress);

    const player1IdsBigN = match0.player1Gotchis;
    const player1Ids = [];

    for (let i = 0; i < player1IdsBigN.length; i++) {
      player1Ids.push(parseInt(ethers.utils.formatUnits(player1IdsBigN[i], 0)));
    }

    expect(player1Ids).to.be.eql(player1Gotchis);
    expect(parseInt(ethers.utils.formatUnits(match0.betsize, 0))).to.be.equal(
      500
    );

    // Check the grid to ensure bonuses/maluses are applied
    const grid = await gettersFacet.getGrid(0);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(grid[i][j].bonus).to.be.within(-2, 2); // Example range check
        expect(grid[i][j].bonusTraitIndex).to.be.within(0, 5); // Trait index check
      }
    }
  });

  it("Should test play card function with bonuses applied", async function () {
    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);

    // Attempting to play an invalid card ID from Alice's set (should fail)
    await expect(
      gameFacet2.playCard(player1Gotchis[0], 0, 2, 0)
    ).to.be.revertedWith("GameFacet: Not your turn");

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );

    // Attempting to play an invalid card ID from Deployer's set (should fail)
    await expect(gameFacet2.playCard(22133, 0, 2, 0)).to.be.revertedWith(
      "GameFacet: Invalid token"
    );

    // Attempting to play with invalid coordinates (should fail)
    await expect(
      gameFacet2.playCard(player1Gotchis[0], 0, 4, 0)
    ).to.be.revertedWith("GameFacet: Invalid coordinates");
    await expect(
      gameFacet2.playCard(player1Gotchis[0], 0, 0, 4)
    ).to.be.revertedWith("GameFacet: Invalid coordinates");

    // Correctly playing the first Gotchi card for the deployer
    await gameFacet2.playCard(player1Gotchis[0], 0, 0, 0);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);

    // Attempting to play the first Gotchi card for Alice
    await expect(
      gameFacet2.playCard(player2Gotchis[0], 0, 0, 0)
    ).to.be.revertedWith("GameFacet: Spot already taken");

    await gameFacet2.playCard(player2Gotchis[0], 0, 1, 1);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );

    // Continue playing the next cards in the sequence
    await gameFacet2.playCard(player1Gotchis[1], 0, 0, 1);

    const grid = await gettersFacet.getGrid(0);
    expect(grid[1][1].winner).to.be.equal(deployerAddress);
  });

  it("Should test match winner with bonuses/maluses", async function () {
    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);

    // Alice plays her first Gotchi card
    await gameFacet2.playCard(player2Gotchis[1], 0, 1, 0);

    let grid = await gettersFacet.getGrid(0);
    expect(grid[1][1].winner).to.be.equal(aliceAddress);
    expect(grid[0][0].winner).to.be.equal(aliceAddress);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );

    // Deployer tries to play a card in an invalid spot (should fail)
    await expect(gameFacet2.playCard(player1Gotchis[1], 0, 2, 0)).to.be
      .reverted;

    // Deployer plays their next Gotchi card in a valid spot
    await gameFacet2.playCard(player1Gotchis[2], 0, 2, 0);

    grid = await gettersFacet.getGrid(0);
    expect(grid[1][0].winner).to.be.equal(deployerAddress);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await gameFacet2.playCard(player2Gotchis[2], 0, 2, 1);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await gameFacet2.playCard(player1Gotchis[3], 0, 2, 2);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await gameFacet2.playCard(player2Gotchis[3], 0, 1, 2);

    // Deployer plays their final Gotchi card to win the match
    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await gameFacet2.playCard(player1Gotchis[4], 0, 0, 2);

    const match0 = await gettersFacet.getMatch(0);
    expect(match0.winner).to.be.equal(deployerAddress);

    // Check the balance after the match concludes
    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress)))
    ).to.be.equal(deployerGhstOriginalBalance + 500);

    await network.provider.send("evm_increaseTime", [86400]);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await expect(gameFacet2.contestMatch(0)).to.be.revertedWith(
      "GameFacet2: already contested"
    );
  });

  it("Should test contest function", async function () {
    deployerGhstOriginalBalance = parseInt(
      ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress))
    );
    aliceGhstOriginalBalance = parseInt(
      ethers.utils.formatUnits(await GHST.balanceOf(aliceAddress))
    );

    gameFacet = await impersonate(deployerAddress, gameFacet, ethers, network);
    await gameFacet.createRoom(player1Gotchis, 200);
    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress)))
    ).to.be.equal(deployerGhstOriginalBalance - 200);

    gameFacet = await impersonate(aliceAddress, gameFacet, ethers, network);
    await gameFacet.joinRoom(0, player2Gotchis);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);

    await expect(gameFacet2.contestMatch(1)).to.be.revertedWith(
      "GameFacet2: not enough time"
    );
    await network.provider.send("evm_increaseTime", [86400]);
    await gameFacet2.contestMatch(1);

    const match1 = await gettersFacet.getMatch(1);
    expect(match1.winner).to.be.equal(aliceAddress);
    expect(match1.contested).to.be.true;
    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress)))
    ).to.be.equal(deployerGhstOriginalBalance - 200);
    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(aliceAddress)))
    ).to.be.equal(aliceGhstOriginalBalance + 200);
  });
});
