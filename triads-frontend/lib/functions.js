import { ethers } from "ethers";

export const checkIfWalletIsConnected = async (
  setConnected,
  setCurrentAccount,
  setProvider
) => {
  const { ethereum } = window;

  if (!ethereum) {
    return;
  }

  setProvider(new ethers.providers.Web3Provider(ethereum));

  const accounts = await ethereum.request({ method: "eth_accounts" });

  if (accounts.length !== 0) {
    const account = accounts[0];
    setCurrentAccount(account);
    setConnected(true);
  }

  let chainId = await ethereum.request({ method: "eth_chainId" });

  const polygonChainId = "0x31337";
  /*     if (chainId !== polygonChainId) {
      alert("You are not connected to the Polygon Network!");
    } */
};

export const connectWallet = async (
  setConnected,
  setCurrentAccount,
  setProvider
) => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }

    setProvider(new ethers.providers.Web3Provider(ethereum));

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    setCurrentAccount(accounts[0]);
    setConnected(true);

    let chainId = await ethereum.request({ method: "eth_chainId" });

    const polygonChainId = "0x31337";
    /*       if (chainId !== polygonChainId) {
        alert("You are not connected to the Polygon Network!");
      } */
  } catch (error) {
    console.log(error);
  }
};

export const register = async (mainContract, betSize, gotchiToPlay) => {
  await mainContract.register(gotchiToPlay, betSize);
};

export const checkGotchiParam = async (id, aavegotchiContract) => {
  const params = await aavegotchiContract.getAavegotchi(id);
  return params.modifiedNumericTraits;
};

export const tokenSvgsOfPlayer1 = async (
  match,
  aavegotchiContract,
  setPlayer1Params,
  setPlayer1Gotchis
) => {
  const player1Ids = match.player1Gotchis;
  for (let i = 0; i < player1Ids.length; i++) {
    let svg = await aavegotchiContract.getAavegotchiSvg(player1Ids[i]);
    const gotchiParams = await checkGotchiParam(
      player1Ids[i],
      aavegotchiContract
    );
    setPlayer1Params((prevPar) => [...prevPar, gotchiParams]);
    console.log(i, player1Ids[i]);
    setPlayer1Gotchis((prevSvg) => [
      ...prevSvg,

      { tokenId: player1Ids[i - 1], svg: svg },
    ]);
  }
};

export const tokenSvgsOfPlayer2 = async (
  match,
  aavegotchiContract,
  setPlayer2Params,
  setPlayer2Gotchis
) => {
  const player2Ids = match.player2Gotchis;
  for (let i = 0; i < player2Ids.length; i++) {
    let svg = await aavegotchiContract.getAavegotchiSvg(player2Ids[i]);
    const gotchiParams = await checkGotchiParam(
      player2Ids[i],
      aavegotchiContract
    );
    setPlayer2Params((prevPar) => [...prevPar, gotchiParams]);
    setPlayer2Gotchis((prevSvg) => [
      ...prevSvg,
      { tokenId: player2Ids[i - 1], svg: svg },
    ]);
  }
};
