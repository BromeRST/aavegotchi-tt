import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer } from "@ethersproject/abstract-signer";
import { deployDiamond } from "../scripts/deploy";
import { GameFacet, GameFacet2, Owner, IERC20, IAavegotchiDiamond } from "../typechain";
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
let bob: Signer;
let bobAddress: string;
let ierc20: IERC20;
let deployerIerc20OriginalBalance: number;
let player1Gotchis: number[];
let player2Gotchis: number[];
let player1GotchiParams: number[][];
let player2GotchiParams: number[][];


describe("Aavegotchi-tt", function () {

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
        "Owner",
        diamondAddress
      )) as Owner;

      ierc20 = (await ethers.getContractAt(
        "IERC20",
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
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
      bob = accounts[2];
      bobAddress = await bob.getAddress();
      player1Gotchis = [3052, 21424, 9358, 12409, 172];
      player2Gotchis = [22133, 1454, 21508, 22128, 2195];
      player1GotchiParams = [];
      player2GotchiParams = [];

/*       for (let i = 0; i < player1Gotchis.length; i++) {
        let aavegotchiInfo = await aavegotchiContract.getAavegotchi(player1Gotchis[i]);
        player1GotchiParams.push(aavegotchiInfo.modifiedNumericTraits)
        let aavegotchiInfo2 = await aavegotchiContract.getAavegotchi(player2Gotchis[i]);
        player2GotchiParams.push(aavegotchiInfo2.modifiedNumericTraits)
      }
      console.log("1", player1GotchiParams)
      console.log("2", player2GotchiParams) */

    });
  
    it("Should test register function", async function () {
      await expect(gameFacet.register([1,2,3,4,5], 111)).to.be.revertedWith("GameFacet: betsize doesn't exist");
      await expect(gameFacet.register([1,2,3,4,5], 10)).to.be.revertedWith("GameFacet: not owner");
      await expect(gameFacet.register([3052, 21424, 3052, 9358, 172], 200)).to.be.revertedWith("GameFacet: same tokenId" );
      
      await ierc20.approve(diamondAddress, ethers.utils.parseUnits("100000000000000000000000000", "ether"));
      
      deployerIerc20OriginalBalance = parseInt(ethers.utils.formatUnits(await ierc20.balanceOf(deployerAddress)));

      await gameFacet.register(player1Gotchis, 500);
      expect(parseInt(ethers.utils.formatUnits(await ierc20.balanceOf(deployerAddress)))).to.be.equal(deployerIerc20OriginalBalance - 500);
    
      gameFacet = await impersonate(aliceAddress, gameFacet, ethers, network);
      ierc20 = await impersonate(aliceAddress, ierc20, ethers, network);
      await ierc20.approve(diamondAddress, ethers.utils.parseUnits("100000000000000000000000000", "ether"));
      await gameFacet.register(player2Gotchis, 500);
    });

    it("Should check match at index 0", async function () {
      const aliceMatchesBigN = await gameFacet.findPlayerMatches();
      const aliceMatches = [];

      for (let i = 0; i < aliceMatchesBigN.length; i++) {
        aliceMatches.push(parseInt(ethers.utils.formatUnits(aliceMatchesBigN[i], 0)));
      }

      expect(aliceMatches).to.be.eql([0]);
      const match0 = await gameFacet.getMatch(0);

      expect(match0.player1).to.be.equal(deployerAddress);
      expect(match0.player2).to.be.equal(aliceAddress);
      
      const player1IdsBigN = match0.player1Gotchis;
      const player1Ids = [];

      for (let i = 0; i < player1IdsBigN.length; i++) {
        player1Ids.push(parseInt(ethers.utils.formatUnits(player1IdsBigN[i], 0)));
      }

      expect(player1Ids).to.be.eql(player1Gotchis);
      expect(parseInt(ethers.utils.formatUnits(match0.betsize, 0))).to.be.equal(500);
    });
    
    it ("Should test play card function", async function () {
      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await expect(gameFacet2.playCard(22133, 0, 2, 0)).to.be.revertedWith("GameFacet: not player 1");

      gameFacet2 = await impersonate(deployerAddress, gameFacet2, ethers, network);
      await expect(gameFacet2.playCard(22133, 0, 2, 0)).to.be.revertedWith("GameFacet: wrong card");
      await expect(gameFacet2.playCard(9358, 0, 4, 0)).to.be.revertedWith("GameFacet: wrong x");
      await expect(gameFacet2.playCard(9358, 0, 0, 4)).to.be.revertedWith("GameFacet: wrong y");

      await gameFacet2.playCard(9358, 0 , 0, 0);

      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await expect(gameFacet2.playCard(21508, 0 , 0, 0)).to.be.revertedWith("GameFacet: wrong coords");
      await gameFacet2.playCard(21508, 0 , 1, 1);


      gameFacet2 = await impersonate(deployerAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(21424, 0 , 0, 1);
      
      const grid = await gameFacet.getGrid(0);
      expect(grid[1][1].winner).to.be.equal(deployerAddress);
    });

    it ("Should test match winner", async function () {

      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(1454, 0 , 1, 0);
      
      let grid = await gameFacet.getGrid(0);
      expect(grid[1][1].winner).to.be.equal(aliceAddress);
      expect(grid[0][0].winner).to.be.equal(aliceAddress);

      gameFacet2 = await impersonate(deployerAddress, gameFacet2, ethers, network);
      await expect(gameFacet2.playCard(21424, 0 , 2, 0)).to.be.reverted;
      await gameFacet2.playCard(3052, 0 , 2, 0);

      grid = await gameFacet.getGrid(0);
      expect(grid[1][0].winner).to.be.equal(deployerAddress);

      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(2195, 0 , 2, 1);

      gameFacet2 = await impersonate(deployerAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(172, 0 , 2, 2);

      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(22128, 0 , 1, 2);

      let stakedAmount = await ownerFacet.checkPlayerStakedAmount();
      expect(parseInt(ethers.utils.formatUnits(stakedAmount))).to.be.equal(1000);

      gameFacet2 = await impersonate(deployerAddress, gameFacet2, ethers, network);
      await gameFacet2.playCard(12409, 0 , 0, 2);

      const match0 = await gameFacet.getMatch(0);
      expect(match0.winner).to.be.equal(deployerAddress);

      stakedAmount = await ownerFacet.checkPlayerStakedAmount();
      expect(parseInt(ethers.utils.formatUnits(stakedAmount))).to.be.equal(0);
      console.log((ethers.utils.formatUnits(stakedAmount)))
      expect(parseInt(ethers.utils.formatUnits(await ierc20.balanceOf(deployerAddress)))).to.be.equal(deployerIerc20OriginalBalance + 500);
      await network.provider.send("evm_increaseTime", [86400]);

      gameFacet2 = await impersonate(aliceAddress, gameFacet2, ethers, network);
      await expect(gameFacet2.contestMatch(0)).to.be.revertedWith("GameFacet2: match already won");
    });
});
