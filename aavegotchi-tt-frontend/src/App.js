import {useEffect, useState} from "react";
import {ConnectButton} from "./components/ConnectButton";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import aavegotchiABI from "./utils/aavegotchiABI"
import ierc20ABI from "./utils/ierc20ABI"
import Grid from "./components/Grid";

const DIAMOND_FORKED_MAINNET_CONTRACT = "0xa00F03Ea2d0a6e4961CaAFcA61A78334049c1848"
const AAVEGOTCHI_FORKED_CONTRACT = "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
const DAI_CONTRACT = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(null);
  const [mainContract, setMainContract] = useState(null);
  const [aavegotchiContract, setAavegotchiContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [match, setMatch] = useState(null);
  const [gridMap, setGridMap] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [xToPlay, setXToPlay] = useState(null);
  const [yToPlay, setYToPlay] = useState(null);
  const [playerIdsToSvgs, setPlayerIdsToSvgs] = useState([]);
  const [player1Gotchis, setPlayer1Gotchis] = useState([]);
  const [player2Gotchis, setPlayer2Gotchis] = useState([]);


  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      return;
    }

    setProvider(new ethers.providers.Web3Provider(ethereum))

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      setConnected(true);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });

    const polygonChainId = "0x31337"; 
/*     if (chainId !== polygonChainId) {
      alert("You are not connected to the Polygon Network!");
    } */
  }

  const connectWallet = async () => {
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
      
      let chainId = await ethereum.request({ method: 'eth_chainId' });

      const polygonChainId = "0x31337"; 
/*       if (chainId !== polygonChainId) {
        alert("You are not connected to the Polygon Network!");
      } */

    } catch (error) {
      console.log(error)
    }
  }

  const register = async () => {
    const gotchiToPlay = [3052, 21424, 9358, 12409, 172]
    await mainContract.register(gotchiToPlay)
  }

  const register2 = async () => {
    const gotchiToPlay = [22133, 1454, 21508, 22128, 2195]
    await mainContract.register(gotchiToPlay)
    let svg;
  }

  const tokenIdsOfPlayer = async () => {
    const gotchiIds = await aavegotchiContract.tokenIdsOfOwner(currentAccount);
    for (let i = 0; i < gotchiIds.length; i ++) {
      let svg = await aavegotchiContract.getAavegotchiSvg(gotchiIds[i]);
      setPlayerIdsToSvgs(previousIds => [...previousIds, svg]);
    }
  }

  const tokenSvgsOfPlayer1 = async () => {
      const player1Ids = match.player1Gotchis;
      for (let i = 0; i < player1Ids.length; i ++) {
        let svg = await aavegotchiContract.getAavegotchiSvg(player1Ids[i]);
        setPlayer1Gotchis(prevSvg => [...prevSvg, {tokenId: player1Ids[i], svg: svg}]);
      }
  }

  const tokenSvgsOfPlayer2 = async () => {
    const player2Ids = match.player2Gotchis;
    for (let i = 0; i < player2Ids.length; i ++) {
      let svg = await aavegotchiContract.getAavegotchiSvg(player2Ids[i]);
      setPlayer2Gotchis(prevSvg => [...prevSvg, {tokenId: player2Ids[i], svg: svg}]);
    }
}

  const getGrid = async () => {
    const grid = await mainContract.getGrid(0); // to pass match id
    setGridMap(grid);
  }

  const playCard = async () => {
    await mainContract.playCard(tokenId, matchId, xToPlay, yToPlay);
    setTimeout(getGrid, 3000);
  }

  const getMatch = async () => {
    const match = await mainContract.getMatch(0);
    console.log("match", match)
    setMatch(match);
  }

  const checkGotchiParam = async (id) => {
    const params = await aavegotchiContract.getAavegotchi(id);
    return params.modifiedNumericTraits;
  }

  const approve = async () => {
    await daiContract.approve(DIAMOND_FORKED_MAINNET_CONTRACT, ethers.utils.parseUnits("100000000000000000000000000", "ether"));
  }

  const handleMatchId = (e) => {
    setMatchId(Number(e.target.value));
  }

  useEffect(() => {
    if(match) {
      tokenSvgsOfPlayer1();
    }
  }, [aavegotchiContract])

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      tokenIdsOfPlayer();
    }
  }, [aavegotchiContract])

  useEffect(() => {
    if(currentAccount !== null) {

      setMainContract(
        new ethers.Contract(
          DIAMOND_FORKED_MAINNET_CONTRACT,
          abi,
          signer || provider
        )
      )

      setAavegotchiContract(
        new ethers.Contract(
          AAVEGOTCHI_FORKED_CONTRACT,
          aavegotchiABI,
          signer || provider
        )
      )

      setDaiContract(
        new ethers.Contract(
          DAI_CONTRACT,
          ierc20ABI,
          signer || provider
        )
      )

    }
  }, [currentAccount])

  useEffect(() => {
    if(provider !== null) {
      setSigner(provider.getSigner());
    }
  }, [provider])

  useEffect(() => {
    if (mainContract) {
      getGrid();
      getMatch();
    }
  }, [mainContract])

  useEffect(() => {
    if (match) {
      tokenSvgsOfPlayer1();
      tokenSvgsOfPlayer2();
    }
  }, [match])

  return (
    <div>
      <div className="nav">
        <p className="app-name">AAVEGOTCHI TT</p>
        <ConnectButton 
          connected={connected}
          setConnected={setConnected}
          currentAccount={currentAccount}
          connectWallet={connectWallet}
        />
      </div>
      <div className="main-wrapper">
        <div>
          <p>PLAYER1 CARDS:</p>
          <div>
            {match !== null && player1Gotchis.map((gotchi, i) => {
              let blob = new Blob([gotchi.svg], {type: 'image/svg+xml'});
              let url = URL.createObjectURL(blob);
              return (
              <div key={i}>
                <p onClick={() => {setTokenId(gotchi.tokenId)}} style={{backgroundImage: `url(${url})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px", /* padding: "20px 10px" */}} />
              </div>
            )})}
          </div>
        </div>
        <div>
          <div className="btns-container">
            <button onClick={register}>register</button>
            <button onClick={register2}>register2</button>
            <button onClick={approve}>approve</button>
            <button onClick={playCard}>play card</button>
            <button onClick={getMatch}>get match</button>
          </div>
          <div className="inputfields">
            <input placeholder="match id" onChange={handleMatchId}/>
          </div>
          <div className="grid-wrapper">
            {gridMap !== null &&
              <Grid 
                gridMap={gridMap} 
                checkGotchiParam={checkGotchiParam} 
                match={match} 
                setXToPlay={setXToPlay} 
                setYToPlay={setYToPlay}
                aavegotchiContract={aavegotchiContract}
              />
            }
          </div>
        </div>
        <div>
          <p>PLAYER2 CARDS:</p>
          <div>
          {match !== null && player2Gotchis.map((gotchi, i) => {
              let blob = new Blob([gotchi.svg], {type: 'image/svg+xml'});
              let url = URL.createObjectURL(blob);
              return (
              <div key={i}>
                <p onClick={() => {setTokenId(gotchi.tokenId)}} style={{backgroundImage: `url(${url})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px", /* padding: "20px 10px" */}} />
              </div>
            )})}
          </div>
        </div>
      </div>
      {playerIdsToSvgs.map((x, i) => {
        let blob = new Blob([x], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(blob);
        return <img key={i} src={url} style={{witdh: "200px", height: "200px"}}/>      
      })}
    </div>
  );
}

export default App;
