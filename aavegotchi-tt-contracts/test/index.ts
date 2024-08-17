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
      "GHST",
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
    player1Gotchis = [3052, 21424, 9358, 12409, 172];
    player2Gotchis = [22133, 1454, 21508, 22128, 2195];

    // Initialize fees and addresses
    await ownerFacet.initializeFeesAndAddresses(
      3, // 3% fee
      1, // 1% to DAO
      1, // 1% to software house
      1, // 1% to developer
      "0xDAOAddressHere", // DAO address
      "0xSoftwareHouseAddressHere", // Software House address
      "0xDeveloperAddressHere" // Developer address
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

    deployerGhstOriginalBalance = parseInt(
      ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress))
    );

    await gameFacet.createRoom(player1Gotchis, 500);

    const expectedBalance = deployerGhstOriginalBalance - 500;
    expect(
      parseInt(ethers.utils.formatUnits(await GHST.balanceOf(deployerAddress)))
    ).to.be.equal(expectedBalance);
  });

  it("Should apply fees correctly when the match is created", async function () {
    const initialDaoBalance = await GHST.balanceOf("0xDAOAddressHere");
    const initialSoftwareHouseBalance = await GHST.balanceOf(
      "0xSoftwareHouseAddressHere"
    );
    const initialDeveloperBalance = await GHST.balanceOf(
      "0xDeveloperAddressHere"
    );

    // Join room as Alice
    gameFacet = await impersonate(aliceAddress, gameFacet, ethers, network);
    GHST = await impersonate(aliceAddress, GHST, ethers, network);
    await GHST.approve(
      diamondAddress,
      ethers.utils.parseUnits("100000000000000000000000000", "ether")
    );
    await gameFacet.joinRoom(0, player2Gotchis);

    // Calculate expected balances after fees
    const totalFee = (500 * 3) / 100;
    const expectedDaoBalance = initialDaoBalance.add(totalFee / 3);
    const expectedSoftwareHouseBalance = initialSoftwareHouseBalance.add(
      totalFee / 3
    );
    const expectedDeveloperBalance = initialDeveloperBalance.add(totalFee / 3);

    expect(await GHST.balanceOf("0xDAOAddressHere")).to.be.equal(
      expectedDaoBalance
    );
    expect(await GHST.balanceOf("0xSoftwareHouseAddressHere")).to.be.equal(
      expectedSoftwareHouseBalance
    );
    expect(await GHST.balanceOf("0xDeveloperAddressHere")).to.be.equal(
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
    await expect(gameFacet2.playCard(22133, 0, 2, 0)).to.be.revertedWith(
      "GameFacet: Not your turn"
    );

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await expect(gameFacet2.playCard(22133, 0, 2, 0)).to.be.revertedWith(
      "GameFacet: Invalid token"
    );
    await expect(gameFacet2.playCard(9358, 0, 4, 0)).to.be.revertedWith(
      "GameFacet: Invalid coordinates"
    );
    await expect(gameFacet2.playCard(9358, 0, 0, 4)).to.be.revertedWith(
      "GameFacet: Invalid coordinates"
    );

    await gameFacet2.playCard(9358, 0, 0, 0);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await expect(gameFacet2.playCard(21508, 0, 0, 0)).to.be.revertedWith(
      "GameFacet: Spot already taken"
    );
    await gameFacet2.playCard(21508, 0, 1, 1);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await gameFacet2.playCard(21424, 0, 0, 1);

    const grid = await gettersFacet.getGrid(0);
    expect(grid[1][1].winner).to.be.equal(deployerAddress);
  });

  it("Should test match winner with bonuses/maluses", async function () {
    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await gameFacet2.playCard(1454, 0, 1, 0);

    let grid = await gettersFacet.getGrid(0);
    expect(grid[1][1].winner).to.be.equal(aliceAddress);
    expect(grid[0][0].winner).to.be.equal(aliceAddress);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await expect(gameFacet2.playCard(21424, 0, 2, 0)).to.be.reverted;
    await gameFacet2.playCard(3052, 0, 2, 0);

    grid = await gettersFacet.getGrid(0);
    expect(grid[1][0].winner).to.be.equal(deployerAddress);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await gameFacet2.playCard(2195, 0, 2, 1);

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await gameFacet2.playCard(172, 0, 2, 2);

    gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
    await gameFacet2.playCard(22128, 0, 1, 2);

    // TODO: check winner balance instead of using checkPlayerStakedAmount

    gameFacet2 = await impersonate(
      deployerAddress,
      gameFacet2,
      ethers,
      network
    );
    await gameFacet2.playCard(12409, 0, 0, 2);

    const match0 = await gettersFacet.getMatch(0);
    expect(match0.winner).to.be.equal(deployerAddress);

    // TODO: check looser balance instead of using checkPlayerStakedAmount
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
