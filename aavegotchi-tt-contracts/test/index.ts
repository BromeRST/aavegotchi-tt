import { expect } from "chai";
import { ethers } from "hardhat";
import {deployDiamond} from "../scripts/deploy"

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    deployDiamond();
  })
});
