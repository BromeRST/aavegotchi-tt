import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { checkIfWalletIsConnected, checkGotchiParam } from "../lib/functions";
import {
  DIAMOND_FORKED_MAINNET_CONTRACT,
  AAVEGOTCHI_FORKED_CONTRACT,
  DAI_CONTRACT,
} from "../lib/constants";
import abi from "../lib/triads.json";
import aavegotchiABI from "../lib/aavegotchiABI.json";
import ierc20ABI from "../lib/ierc20ABI.json";

const Contracts = createContext();

export const ContractsProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [mainContract, setMainContract] = useState(null);
  const [aavegotchiContract, setAavegotchiContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [playerMatchesId, setPlayerMatchesId] = useState(null);
  const [playerIdsToSvgs, setPlayerIdsToSvgs] = useState([]);
  const [playerAllGotchiParams, setPlayerAllGotchiParams] = useState([]);
  const [matchId, setMatchId] = useState(null);
  const [betSize, setBetSize] = useState(null);
  const [tokenIds, setTokenIds] = useState([]);
  const [confirmedBet, setConfirmedBet] = useState(false);
  const [confirmedIds, setConfirmedIds] = useState(false);
  const [xToPlay, setXToPlay] = useState(null);
  const [yToPlay, setYToPlay] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  const findPlayerMatches = async () => {
    const matches = await mainContract.findPlayerMatches();
    const m = [];
    if (matches.length > 0) {
      m.push(parseInt(ethers.utils.formatUnits(matches[0], 0)));
      for (let i = 0; i < matches.length; i++) {
        if (parseInt(ethers.utils.formatUnits(matches[i], 0)) !== m[i]) {
          m.push(parseInt(ethers.utils.formatUnits(matches[i], 0)));
        }
      }
      setPlayerMatchesId(m);
    }
  };

  const tokenIdsOfPlayer = async () => {
    const gotchiIds = await aavegotchiContract.tokenIdsOfOwner(currentAccount);
    for (let i = 0; i < gotchiIds.length; i++) {
      let svg = await aavegotchiContract.getAavegotchiSvg(gotchiIds[i]);
      setPlayerIdsToSvgs((previousIds) => [
        ...previousIds,
        { tokenId: gotchiIds[i], svg: svg },
      ]);
      const gotchiParams = await checkGotchiParam(
        gotchiIds[i],
        aavegotchiContract
      );
      setPlayerAllGotchiParams((prevPar) => [...prevPar, gotchiParams]);
    }
  };

  useEffect(() => {
    if (currentAccount && aavegotchiContract) {
      tokenIdsOfPlayer();
    }
  }, [aavegotchiContract]);

  useEffect(() => {
    checkIfWalletIsConnected(setConnected, setCurrentAccount, setProvider);
  }, []);

  useEffect(() => {
    if (currentAccount !== null) {
      setMainContract(
        new ethers.Contract(
          DIAMOND_FORKED_MAINNET_CONTRACT,
          abi,
          signer || provider
        )
      );

      setAavegotchiContract(
        new ethers.Contract(
          AAVEGOTCHI_FORKED_CONTRACT,
          aavegotchiABI,
          signer || provider
        )
      );

      setDaiContract(
        new ethers.Contract(DAI_CONTRACT, ierc20ABI, signer || provider)
      );
    }
  }, [currentAccount]);

  useEffect(() => {
    if (provider !== null) {
      setSigner(provider.getSigner());
    }
  }, [provider]);

  useEffect(() => {
    if (mainContract) {
      const REGISTERED_FILTER = mainContract.filters.MatchGenerated(
        currentAccount,
        null,
        null
      );
      mainContract.on(REGISTERED_FILTER, findPlayerMatches);
      const REGISTERED_FILTER2 = mainContract.filters.MatchGenerated(
        null,
        currentAccount,
        null
      );
      mainContract.on(REGISTERED_FILTER2, findPlayerMatches);
    }
  }, [mainContract]);

  return (
    <Contracts.Provider
      value={{
        provider,
        signer,
        currentAccount,
        connected,
        mainContract,
        aavegotchiContract,
        daiContract,
        playerMatchesId,
        playerIdsToSvgs,
        matchId,
        betSize,
        playerAllGotchiParams,
        tokenIds,
        confirmedBet,
        confirmedIds,
        setConfirmedIds,
        setConfirmedBet,
        setTokenIds,
        setConnected,
        setCurrentAccount,
        setProvider,
        setMatchId,
        setBetSize,
        findPlayerMatches,
        xToPlay,
        setXToPlay,
        yToPlay,
        setYToPlay,
        tokenId,
        setTokenId,
      }}
    >
      {children}
    </Contracts.Provider>
  );
};

export default Contracts;
