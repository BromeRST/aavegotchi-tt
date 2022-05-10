// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {AppStorage, Modifiers, Match, Register, Tile} from "../libraries/AppStorage.sol";
import "../interfaces/IPool.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

contract Owner is Modifiers {

    function withdraw() external onlyOwner {
        IPool(s.aavePool).withdraw(s.dai, type(uint256).max - s.playersAmountStaked, LibDiamond.contractOwner());
    }

    function checkPlayerStakedAmount() external view returns(uint256) {
        return s.playersAmountStaked;
    }

    /*     function swapExactInputSingle(uint256 amountIn) external payable returns (uint256 amountOut) {
        uint256 poolFee = 3000;
        ISwapRouter swapRouter = ISwapRouter(s.swapRouterAddress);
        IERC20 daiContract = IERC20(s.dai);

        // Transfer the specified amount of DAI to this contract.
        daiContract.transferFrom(msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        daiContract.approve(address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: s.dai,
                tokenOut: s.weth,
                fee: uint24(poolFee),
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    } */
}